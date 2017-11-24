# require "slang"

module App
  module Model
    class Chart
      getter id : String
      getter title : String
      getter comment : String

      property xes : Array(Int32)
      property corrects : Array(Float64)
      property deltas : Array(Float64)

      XES_MAX_DEMO = 1000

      def initialize(@id, @title, @comment)
        @xes = [] of Int32
        @corrects = [] of Float64
        @deltas = [] of Float64
      end

      def append_demo_data(qty : Int32 = 1, dx = 5)
        if xes.size == 0 || xes.last < XES_MAX_DEMO
          (0...qty).each do
            @xes << (xes.size + 1) * dx
            @corrects << rand
            @deltas << rand
          end
        end
        self
      end

      def to_page_command
        {
          command: "update_chart",
          id: id,
          title: title,
          comment: comment,
          xes: xes,
          corrects: corrects,
          deltas: deltas
        }.to_json
      end
    end
  end
end
