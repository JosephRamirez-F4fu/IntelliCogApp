import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './login.html',
  styleUrls: ['./auth.css']
})
export class Login {

}
