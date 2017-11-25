require "json"
require "kemal"
require "./app/*"

bot_init_delay = 10
bot_sleep_dur = 5.0

module App #  ExampleAppKemalGraphs
  module Dashboard
    STATUS_HIST = ["loading"]
    CHARTS = [] of Chart
    SOCKETS = [] of HTTP::WebSocket
    MESSAGES = [] of String
    EXAMPLE_CHART = App::Model::Chart.new(id: "example", title: "Some Title", comment: "Some<br/>Comment ...")
    EXAMPLE_CHARTS = [] of App::Model::Chart
  end
end

get "/" do
  "Hello World!"
end

get "/dashboard" do
  # TODO: update past Crystal 0.23.1 to get fix for "Error executing run: ecr/process", as noted in "https://github.com/crystal-lang/crystal/issues/4577"
  render "src/app/view/dashboard/index.ecr"
end

ws "/dashboard" do |socket|
  # App::Dashboard::SOCKETS << socket unless App::Dashboard::SOCKETS.includes?(socket)
  unless App::Dashboard::SOCKETS.includes?(socket)
    puts "Adding socket: #{socket}"
    App::Dashboard::SOCKETS << socket
  end

  # Send welcome message to the client
  socket.send "Hello from Kemal!"

  # Handle incoming message and echo back to the client
  socket.on_message do |message|
    msg_id = nil
    msg_values = nil # JSON::Any.new
    msg_type = "tbd"
    msg_slashed = Hash(String, Array(String)).new
    parsing_error = "" # Hash(String, String | Array(String)).new # nil # {}
    msg_from_json = nil # {}

    begin
      msg_spaced = message.split(" ")
      if message[0] == '/'
        msg_type = "slash"
        msg_spaced.each do |ms|
          ms_key_value = ms.split(":")
          k = ms_key_value.shift
          v = ms_key_value
          msg_slashed[k.to_s] = v
        end
      elsif message[0] == '{'
        msg_type = "json"
        msg_from_json = JSON.parse(message)
      else
        msg_type = "id_values"
        msg_id = msg_spaced.shift
        msg_values = msg_spaced
        # if msg.
      end
    rescue e
      # parsing_error = {message: "Parsing Error", orig_class: e.class.name, orig_message: e.message, orig_backtrace: e.backtrace}
      parsing_error = "Parsing Error: message: #{message}, error: #{e}"
    end

    App::Dashboard::SOCKETS.each do |s|
      begin
        if parsing_error.size > 0 # !parsing_error.nil?
          s.send(parsing_error.to_json)
        else
          case msg_type
            when "slash"
              s.send({msg_type: msg_type, message: msg_slashed}.to_json)
            when "id_values"
              s.send({msg_type: msg_type, message: {id: msg_id, values: msg_values}}.to_json)
              bot_sleep_dur = msg_values.first.to_f64 if msg_id == "bot_sleep_dur" && msg_values && msg_values.as(Array(String)).first.to_f64 > 0
            when "json"
              s.send({msg_type: msg_type, message: msg_from_json}.to_json)
            else
              s.send({error: "Didn't process", message: message}.to_json)
          end
        end
      rescue e
        s.send("Error: #{e}".to_json)
      end
    end
  end

  # Executes when the client is disconnected. You can do the cleaning up here.
  socket.on_close do
    puts "Closing socket: #{socket}"
    App::Dashboard::SOCKETS.delete socket
  end
end


spawn do
  sleep(bot_init_delay)
  App::Dashboard::STATUS_HIST << "running"

  (0..5).to_a.each {|i| App::Dashboard::EXAMPLE_CHARTS << App::Model::Chart.new(id: "example_#{i}", title: "Some Title #{i}", comment: "Some #{i}<br/>Comment ...") }

  while App::Dashboard::STATUS_HIST.last == "running" && ! App::Dashboard::MESSAGES.last(10).includes?("bot_sleep_mode")
    begin
      App::Dashboard::EXAMPLE_CHARTS.each do |chart|
        next if rand < 0.25 # Since it's just a demo anyways, let's only update some of the graphs at random

        chart.append_demo_data
        msg = chart.to_page_command
        App::Dashboard::MESSAGES << msg

        App::Dashboard::SOCKETS.each { |socket| socket.send(msg) }
      end

      # ... but always update this graph (for comparison)
      App::Dashboard::EXAMPLE_CHART.append_demo_data
      msg = App::Dashboard::EXAMPLE_CHART.to_page_command
      App::Dashboard::MESSAGES << msg

      while (App::Dashboard::MESSAGES.size > 100)
        deleted_item = App::Dashboard::MESSAGES.shift
        puts "Cleaning App::Dashboard::MESSAGES; removed old message: #{deleted_item}"
      end

      puts "App::Dashboard::MESSAGES.size: #{App::Dashboard::MESSAGES.size}"
      puts "App::Dashboard::MESSAGES.last(10): #{App::Dashboard::MESSAGES.last(10)}"
      puts "bot msg: #{msg}"
      App::Dashboard::SOCKETS.each { |socket| socket.send(msg) }
      sleep(bot_sleep_dur)
    rescue e
      puts "Socket send error: #{e.pretty_inspect}" # "#{ {dir: __DIR__, file: __FILE__, line: __LINE__, class: self.class.name, method: {{@def.name.stringify}}, message: "some message" }.pretty_inspect }"
    end
  end
  App::Dashboard::STATUS_HIST << "sleeping"
  App::Dashboard::SOCKETS.each { |socket| socket.send({ when: Time.now.to_utc, status_hist: App::Dashboard::STATUS_HIST}.to_json) }
end

Kemal.run
