import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  @Input() contactForm!: FormGroup;
  @Input() isSubmitting = false;
  
  @Output() formSubmit = new EventEmitter<void>();

  onSubmit(): void {
    this.formSubmit.emit();
  }
}
