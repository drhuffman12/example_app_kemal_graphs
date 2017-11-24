
      var msg_num = 0;
      var messages_max_hist_size = 10;

      function note_updated_area(area_filter) {
        $(area_filter).removeClass("note_updated_area");
        setTimeout(function() {
            $(area_filter).addClass("note_updated_area");
        }, 1);
      }

      $(document).ready(function() {
        update_chart_example_foo();
        update_chart_example_widget();

        // Open WebSocket connection
        var ws = new WebSocket("ws://" + location.host + "/dashboard");

        ws.onmessage = function(e) {
          msg_num += 1;
          console.log({msg_num: msg_num, message: e.data});

          // keep no more than 'messages_max_hist_size'
          while ($('#messages').html().split(/\n/).length > messages_max_hist_size) {
            var all = $('#messages').html().split(/\n/)
            var recent = all.slice(0, messages_max_hist_size).join("\n");

            console.log("** Trimming messages count down from #{all.size} to #{messages_max_hist_size}. **");

            $('#messages').html(recent);
          }

          var json_data = null;
          try {
            console.log(e.data);

            json_data = JSON.parse(e.data);

            var command = 'n/a';
            var target = '';
            var content = '';
            var params = [];

            var context_jq_obj = 'n/a';
            var target_jq_obj = 'n/a';

            if(json_data.hasOwnProperty('command')){
              command = json_data["command"].toString();
            }

            if(json_data.hasOwnProperty('target')){
              target = json_data["target"].toString();

              target_jq_obj = $(target)
            }

            if(json_data.hasOwnProperty('content')){
              content = json_data["content"].toString();
            }

            if(json_data.hasOwnProperty('params')){
              params = json_data["params"].toString();
            }

            // if (target != '' && command != '') {
            if (command != '') {
              switch (command) {
                case 'update_chart':
                  update_chart_given(json_data);
                  console.log('command: "prepend !!!" .. content: ' + content);
                  break;
                case 'prepend':
                  $(target).prepend(content);
                  console.log('command: "prepend !!!" .. content: ' + content);
                  break;
                case 'append':
                  $(target).append(content);
                  console.log('command: "append !!!" .. content: ' + content);
                  break;
                case 'before':
                  $(target).before(content);
                  break;
                case 'after':
                  $(target).after(content);
                  break;
                case 'text':
                  $(target).text(content);
                  break;
                case 'html':
                  $(target).html(content);
                  console.log('command: "html !!!" .. content: ' + content);
                  break;
                case 'val':
                  $(target).val(content);
                  break;
                case 'remove':
                  $(target).remove();
                  break;
                default:
                  $('#messages').prepend(JSON.stringify({msg_num: msg_num, message: e.data}) + "\n");
                  note_updated_area('#messages_area');
                  console.log('command: "default !!!"');
              }
            }
          } catch(err) {
            document.getElementById("error_log").innerHTML = err.message;
            note_updated_area('#error_log_area');
            console.log(err);
          }
        };

        $("form").bind('submit', function(e) {
          var message = $('#msg').val();
          ws.send(message);
          $('#msg').val(''); $('#msg').focus();
          e.preventDefault();
        });
      });