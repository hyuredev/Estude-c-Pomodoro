import { Component, OnInit } from '@angular/core';
import { Tarefa } from '../models/tarefa';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
})
export class Tab3Page{
  completedTasks: Tarefa[] = []; // Tarefas concluídas
  weekDays: string[] = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  totalProductiveTime: number = 0; // Total de tempo produtivo em segundos
  recentActivities: any[] = []; // Lista de atividades recentes

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
  ) {}

  calculateProductivity() {
    // Aqui você pode calcular as tarefas completas e o tempo total
    this.totalProductiveTime = this.recentActivities.reduce((total, activity) => total + activity.timeSpent, 0);
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
