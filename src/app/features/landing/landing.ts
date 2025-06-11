import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [
    NgOptimizedImage,
    RouterLink
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {

}
