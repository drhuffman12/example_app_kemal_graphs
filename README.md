# example_app_kemal_graphs

```sh
# install dependancies
crystal deps

# run (without compiling)
bin/run

# run (with compiling)
bin/build
bin/app
```

To adjust the update speed of the graphs, enter `bot_sleep_dur <delay>` in the message form. For example, `bot_sleep_dur 5` will trigger a 5 second delay and `bot_sleep_dur 0.5` will trigger a half-second delay. (Be careful; your browser will probably lock up if you set the value too low.)

![example screenshot](doc/screenshots/browser_screenshot.png)
