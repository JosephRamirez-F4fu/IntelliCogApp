import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'delete-account-modal',
  standalone: true,
  template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>Eliminar cuenta</h2>
        <p>
          ¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.
        </p>
        <div class="actions">
          <button class="btn delete" (click)="confirm()">Eliminar</button>
          <button class="btn cancel" (click)="cancel()">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./delete-account-modal.component.css'],
})
export class DeleteAccountModal {
  @Output() confirmed = new EventEmitter<boolean>();

  confirm() {
    this.confirmed.emit(true);
  }
  cancel() {
    this.confirmed.emit(false);
  }
}
