import { Component} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';  // Adicionando a importação do ToastController
import { TaskService } from '../services/task.service';  // Importe o serviço

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page{
  displayMinutes: string = '25';
  displaySeconds: string = '00';
  timer: any;
  timeLeft: number = 0;
  mode: string = 'pomodoro'; // Começa no modo Pomodoro
  isRunning: boolean = false;
  hasStarted: boolean = false;

  // Configurações de tempo
  pomodoroTime: number = 25; // Tempo do Pomodoro
  shortBreakTime: number = 5; // Tempo de Pausa Curta
  longBreakTime: number = 15; // Tempo de Pausa Longa

  //Criacao de Tarefas
  taskTitle: string = '';
  taskCycles: number = 1;
  tasks: Array<{ title: string, cycles: number, status: string, isSelected: boolean }> = [];
  completedTasks: Array<{ title: string, cycles: number }> = [];

  // Ciclos completos realizados
  completedCycles: number = 0;  // Nova propriedade para contar os ciclos completos

  // Ciclos completos realizados para contagem total
  completedCyclesTask = 0;  // Inicialize a variável no início

  // Variável que controla a visibilidade do formulário
  showCreateTask: boolean = false;  

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private taskService: TaskService,
    private toastController: ToastController  // Injeta o ToastController
  ) {
    this.setTimer();
  }

  // Função para alternar a visibilidade do formulário
  toggleCreateTask() {
    this.showCreateTask = !this.showCreateTask;
  }

  setTimer() {
    switch (this.mode) {
      case 'pomodoro':
        this.timeLeft = this.pomodoroTime * 60; // Inicia com tempo de Pomodoro
        break;
      case 'shortBreak':
        this.timeLeft = this.shortBreakTime * 60; // Inicia com tempo de pausa curta
        break;
      case 'longBreak':
        this.timeLeft = this.longBreakTime * 60; // Inicia com tempo de pausa longa
        break;
    }
    this.updateDisplay();
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning = true;
    this.hasStarted = true;
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        this.pauseTimer();
        this.switchMode();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.timer);
  }

  skipTimer() {
    this.pauseTimer();
    this.switchMode();
  }

  switchMode() {
    if (this.mode === 'pomodoro') {
      // Incrementa completedCyclesTask após cada Pomodoro
      this.completedCyclesTask++;
      console.log(`Pomodoro completo! Total de ciclos completos: ${this.completedCyclesTask}`);
  
      // Lógica para alternar para o intervalo após Pomodoro
      if (this.completedCycles % 3 === 0 && this.completedCycles !== 0) {
        console.log(`Ciclo ${this.completedCycles}: Mudando para Long Break`);
        this.mode = 'longBreak';  // Após 3 ciclos, será um Long Break
      } else {
        console.log(`Ciclo ${this.completedCycles}: Mudando para Short Break`);
        this.mode = 'shortBreak';  // Caso contrário, será um Short Break
      }
    } else if (this.mode === 'shortBreak' || this.mode === 'longBreak') {
      // Após o Long Break, os ciclos são resetados
      if (this.mode === 'longBreak') {
        console.log(`Após Long Break: Resetando ciclos para 0`);
        this.completedCycles = 0; // Reseta os ciclos após Long Break
      } else {
        console.log(`Ciclo ${this.completedCycles}: Incrementando ciclos completos`);
        this.completedCycles++;  // Incrementa os ciclos completos
      }
  
      console.log('Voltando para Pomodoro');
      this.mode = 'pomodoro';  // Volta para o ciclo Pomodoro
  
      // Exibe o toast "Hora do trabalho!" quando entrar no modo Pomodoro
      this.presentToast("Hora do trabalho!", 'success');
    }
  
    this.setTimer();
  }
  

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.displayMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
    this.displaySeconds = seconds < 10 ? '0' + seconds : seconds.toString();
  }

  changeMode(event: any) {
    this.mode = event.detail.value;
    this.pauseTimer();
    this.setTimer();
    if (this.isRunning) {
      this.startTimer();
    }
  }

  // Criacao de Tarefas

  createTask() {
    if (this.taskTitle.trim() !== '' && this.taskCycles > 0) {
        // Criação de uma nova tarefa
        const newTask = {
            title: this.taskTitle,
            cycles: this.taskCycles,
            status: 'Pendente', // status inicial
            isSelected: false // inicialmente a tarefa não está selecionada
        };

        // Adiciona a nova tarefa à lista de tarefas
        this.tasks.push(newTask);

        // Resetando o contador de ciclos completos
        this.completedCyclesTask = 0;
        console.log(`Nova tarefa criada. O contador de ciclos foi resetado para: ${this.completedCyclesTask}`);

        // Reseta os campos de entrada
        this.taskTitle = '';
        this.taskCycles = 1;  // Resetando os campos de entrada para valores padrão
        this.showCreateTask = false;  // Esconde o formulário novamente após a criação
    }
  }

  
  toggleTaskStatus(task: { title: string, cycles: number, status: string, isSelected: boolean }) {
    task.isSelected = !task.isSelected;

    if (task.isSelected) {
      // Iniciar a tarefa se não estiver em progresso
      this.startTask(task);
    } else {
      // Pausar a tarefa
      task.status = 'Pendente';
    }
  }

  startTask(task: { title: string, cycles: number, status: string, isSelected: boolean }) {
    let cyclesCompleted = 0;

    task.status = 'Em progresso'; // Marca como "Em progresso"

    const intervalId = setInterval(() => {
      if (this.completedCyclesTask < task.cycles) {
        cyclesCompleted++;
        console.log(`Tarefa ${task.title}: Ciclo ${this.completedCyclesTask} de ${task.cycles}`);
      } else {
        task.status = 'Concluída';
        this.completedCyclesTask = 0;
        clearInterval(intervalId);

        // Exibe o Toast de sucesso após concluir a tarefa
        this.presentToast("Tarefa concluída! Você está no caminho certo!🎉😀", 'success');
        
        // Mover tarefa para o serviço de tarefas concluídas
        this.taskService.addCompletedTask({
          title: task.title,
          cycles: task.cycles
        });

        // Remover tarefa da lista de tarefas pendentes
        this.tasks = this.tasks.filter(t => t !== task);
      }
    }, 1000);  // Executa a cada 1 segundo, simulando um ciclo.
  }
  
  //Verifica se o usuario está logado, e direciona ou para perfil, ou para login
  openProfile() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.router.navigate(['/perfil']);
      } else {
        this.router.navigate(['/login-cadastro']);
      }
    });
  }

  async presentToast(message: string, color: string = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,  // Duração do toast (em milissegundos)
      position: 'bottom',  // Posição do toast (bottom, top, middle)
      color: color,  // Cor do toast (light, dark, success, danger, etc.)
    });
    toast.present();
  }
}
