import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './register.html',
  styleUrls: ['./auth.css']
})
export class Register {

}
