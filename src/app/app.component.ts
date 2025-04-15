import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

export interface Reminder {
  text: string;
  time: string;
  isPast: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnDestroy {

  reminders: Reminder[] = [];
  currentTime: Date = new Date();
  fastForward: boolean = false;
  intervalSpeed: number = 1000;
  reminderForm: FormGroup;
  reminderText: string = '';
  reminderTime: string = '';
  stopTimeSubscription$: Subscription = new Subscription();

  private formBuilder = inject(FormBuilder);

  constructor() {
    this.stopTimeSubscription$ = interval(this.intervalSpeed).subscribe(() => {
      this.currentTime = new Date(this.currentTime.getTime() + (this.fastForward ? 60000 : this.intervalSpeed));
      this.checkReminders();
    })

    const initialDate = new Date();
    const pad = (number: number) => (number.toString()).padStart(2, '0');
    this.reminders.push({
      text: 'Current time +1m',
      time: `${pad(initialDate.getHours())}:${pad(initialDate.getMinutes() + 1)}`,
      isPast: false
    })

    this.reminderForm = this.formBuilder.group({
      text: ['', Validators.required],
      time: ['', Validators.required],
      isPast: [false, Validators.required]
    })
  }

  checkReminders() {
    const currentMinutes = (this.currentTime.getHours() * 60) + this.currentTime.getMinutes();
    this.reminders.forEach((reminder: Reminder) => {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const reminderMinutes = (hours * 60) + minutes;
      reminder.isPast = currentMinutes >= reminderMinutes;
    })
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  toggleClockSpeed() {
    this.fastForward = !this.fastForward;
  }

  addReminder() {
    if (this.reminderForm.valid) {
      this.reminders.push(this.reminderForm.value);
      this.reminderForm.reset();
      this.reminderForm.get('isPast')?.patchValue(false);
    }
  }

  ngOnDestroy(): void {
    this.stopTimeSubscription$.unsubscribe();
  }

}
