import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  User,
  UserService,
} from 'app/features/dashboard/services/user-service';

@Component({
  selector: 'app-user-link',
  templateUrl: './user-link.component.html',
  styleUrls: ['./user-link.component.css'],
  standalone: true,
  providers: [UserService],
  imports: [RouterModule, CommonModule],
})
export class UserLinkComponent {
  user!: User;

  constructor(private userService: UserService) {
    this.userService.getUser().subscribe((user) => {
      this.user = user;
    });
  }
}
