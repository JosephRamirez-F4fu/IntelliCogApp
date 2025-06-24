import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { UserService, User } from '../../services/user-service';
import { SnackbarService } from '@core/services/snackbar-service';

import { OverlayModalService } from '@components/overlay/overlay.service';
import { DeleteAccountModal } from './delete-account/delete-account.component';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, ReactiveFormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  providers: [UserService],
})
export class Home implements OnInit {
  user?: User;
  editMode = false;
  passwordMode = false;
  loading = false;
  especialities = ['Endocrinología', 'Neurología', 'Psiquiatría', 'Geriatría'];

  profileForm = new FormGroup({
    name: new FormControl({ value: '', disabled: true }, Validators.required),
    last_name: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    email: new FormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.email,
    ]),
    speciality: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
  });

  passwordForm = new FormGroup({
    oldPassword: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    newPassword: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    confirmPassword: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
  });

  constructor(
    private userService: UserService,
    private snackbar: SnackbarService,
    private overlayModal: OverlayModalService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    this.userService.getUser().subscribe({
      next: (user) => {
        console.log('User loaded:', user);
        this.user = user;
        this.profileForm.patchValue(user);
        this.profileForm.disable();
      },
      error: () => {
        this.user = undefined;
      },
    });
  }

  enableEdit() {
    this.editMode = true;
    this.profileForm.enable();
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.snackbar.show(
        'Completa todos los campos correctamente',
        'error',
        3000
      );
      return;
    }
    this.loading = true;
    this.userService
      .updateUser(this.profileForm.getRawValue() as User)
      .subscribe({
        next: (user) => {
          this.snackbar.show('Perfil actualizado', 'success', 3000);
          this.user = user;
          this.editMode = false;
          this.loading = false;
          this.profileForm.disable();
        },
        error: () => {
          this.snackbar.show('Error al actualizar perfil', 'error', 3000);
          this.loading = false;
        },
      });
  }

  cancelEdit() {
    this.editMode = false;
    if (this.user) {
      this.profileForm.patchValue(this.user);
    }
    this.profileForm.disable();
  }

  enablePassword() {
    this.passwordMode = true;
    this.passwordForm.reset();
    this.passwordForm.enable();
  }

  savePassword() {
    if (this.passwordForm.invalid) {
      this.snackbar.show('Completa todos los campos', 'error', 3000);
      return;
    }
    const { oldPassword, newPassword, confirmPassword } =
      this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.snackbar.show('Las contraseñas no coinciden', 'error', 3000);
      return;
    }
    this.loading = true;
    this.userService
      .changePassword(oldPassword!, newPassword!, confirmPassword!)
      .subscribe({
        next: () => {
          this.snackbar.show('Contraseña cambiada', 'success', 3000);
          this.passwordMode = false;
          this.loading = false;
          this.passwordForm.disable();
        },
        error: () => {
          this.snackbar.show('Error al cambiar contraseña', 'error', 3000);
          this.loading = false;
        },
      });
  }

  cancelPassword() {
    this.passwordMode = false;
    this.passwordForm.reset();
    this.passwordForm.disable();
  }

  deleteAccount() {
    const ref = this.overlayModal.open(DeleteAccountModal);
    const instance = ref.instance as DeleteAccountModal;
    instance.confirmed.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.loading = true;
        this.userService.deleteUser().subscribe({
          next: () => {
            this.snackbar.show('Cuenta eliminada', 'success', 3000);
            this.loading = false;
            this.overlayModal.close();
          },
          error: () => {
            this.snackbar.show('Error al eliminar cuenta', 'error', 3000);
            this.loading = false;
            this.overlayModal.close();
          },
        });
      } else {
        this.overlayModal.close();
      }
    });
  }
}
