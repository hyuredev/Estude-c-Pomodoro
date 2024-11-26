import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private completedTasks: Array<{ title: string, cycles: number }> = [];

  constructor() { }

  // Método para adicionar uma tarefa concluída
  addCompletedTask(task: { title: string, cycles: number }) {
    this.completedTasks.push(task);
  }

  // Método para obter todas as tarefas concluídas
  getCompletedTasks() {
    return this.completedTasks;
  }
}
