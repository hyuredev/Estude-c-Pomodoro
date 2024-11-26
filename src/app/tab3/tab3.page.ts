import { Component, OnInit } from '@angular/core';
import { Tarefa } from '../models/tarefa';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';  // Importe o serviço


@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
})
export class Tab3Page{
  weekDays: string[] = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  completedTasks: Array<{ title: string, cycles: number }> = [];

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    // Ao carregar a página, obtemos as tarefas concluídas do serviço
    this.completedTasks = this.taskService.getCompletedTasks();
  }



  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} seg`;
  }

  openProfile() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.router.navigate(['/perfil']);
      } else {
        this.router.navigate(['/login-cadastro']);
      }
    });
  }
}
