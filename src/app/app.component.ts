import { Component, OnInit } from '@angular/core'
import hotkeys from 'hotkeys-js'
import * as moment from 'moment'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'squat-timer'
  mainState = {
    minutes: 30,
    seconds: 0,
    minutesUntilPause: 5,
    secondsUntilPause: 0,
    banner: true
  }
  interval: number
  running = false
  audioPlayer: HTMLAudioElement
  goalTime: string

  ngOnInit() {
    const state = JSON.parse(localStorage.getItem('squatTimer'))
    if (state) {
      this.mainState = state
    }

    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => this.save())
      input.addEventListener('keyup', (e) => {
        switch (e.key) {
          case 'Enter':
            this.run()
            input.blur()
            break
          case 'Escape':
            input.blur()
        }
      })
    })

    this.audioPlayer = <HTMLAudioElement>document.getElementById('audio')

    hotkeys('enter, space', (event) => {
      event.preventDefault() 
      this.run()
    })
  }

  closeBanner() {
    this.mainState.banner = false
    this.save()
  }

  save() {
    localStorage.setItem('squatTimer', JSON.stringify(this.mainState))
  }

  run() {
    if (!this.running) {
      this.startTimer()
      this.running = true
    } else {
      clearInterval(this.interval)
      this.running = false
    }
  }

  startTimer() {
    let finished = false
    const minutesUntilPause = this.mainState.minutesUntilPause
    const secondsUntilPause = this.mainState.secondsUntilPause
    const totalSecondsUntilPause = minutesUntilPause * 60 + secondsUntilPause
    let counter = 0
    
    const minutes = this.mainState.minutes
    const seconds = this.mainState.seconds
    const currentSeconds = minutes * 60 + seconds
    if (currentSeconds < totalSecondsUntilPause) {
      this.goalTime = '00:00'
    } else {
      var time = moment.duration(`00:${minutesUntilPause}:${secondsUntilPause}`);
      var date = moment(`2014-06-07 00:${minutes}:${seconds}`);
      date.subtract(time);
      const timeSlices = date.format().split(/[:+]/)
      this.goalTime = `${timeSlices[1]}:${timeSlices[2]}`
    }

    this.interval = setInterval(() => {
      if (this.mainState.minutes === 0 && this.mainState.seconds === 0) {
        finished = true
        clearInterval(this.interval)
        this.running = false
        this.audioPlayer.play()
      }
      if (!finished) {
        if (this.mainState.seconds === 0) {
          this.mainState.minutes--
          this.mainState.seconds = 59
        } else {
          this.mainState.seconds--
        }
      }
      counter++
      if (counter === totalSecondsUntilPause) {
        clearInterval(this.interval)
        this.running = false
        this.audioPlayer.play()
      }
      this.save()
    }, 1000)
  }
}
