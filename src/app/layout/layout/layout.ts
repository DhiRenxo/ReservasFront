import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true, 
  imports: [CommonModule, Sidebar, RouterOutlet],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'] 
})
export class Layout {
  isSidebarCollapsed = false;

  toggleSidebar(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
}
