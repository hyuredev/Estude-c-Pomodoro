import { Component, ViewChild, OnInit } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import firebase from 'firebase/compat/app';
import { ToastController } from '@ionic/angular'; // Importando o ToastController

@Component({
  selector: 'app-login-cadastro',
  templateUrl: './login-cadastro.page.html',
  styleUrls: ['./login-cadastro.page.scss'],
})
export class LoginCadastroPage {
  @ViewChild(IonModal) modal: IonModal | undefined;

  // Propriedades para login
  email: string = '';
  password: string = '';
  name: string = '';
  cpf: any = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController // Injeta o ToastController
  ) {}

  // Função para exibir um toast
  async presentToast(message: string, duration: number = 3000, color: string = 'dark'): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color,
      position: 'bottom', // Posição na tela
    });
    toast.present();
  }

  register() {
    this.authService.registrarUsuario(this.email, this.password, this.name, this.cpf)
      .then(() => {
        this.cancel();
      })
      .catch(error => {
        this.presentToast('Erro no registro: ' + error.message, 3000, 'danger');
      });
  }

  submitLogin() {
    this.authService.loginUsuario(this.email, this.password)
      .then(userData => {
        if (userData) {
          this.presentToast('Usuário logado com sucesso!', 3000, 'success');
          this.router.navigate(['/perfil']);
        } else {
          this.presentToast('Dados do usuário não encontrados.', 3000, 'warning');
        }
      })
      .catch(error => {
        this.presentToast('Erro no login: ' + error.message, 3000, 'danger');
      });
  }

  googleLogin() {
    this.authService.googleLogin()
      .then(() => {
        this.presentToast('Login com Google realizado com sucesso!', 3000, 'success');
      })
      .catch(error => {
        this.presentToast('Erro ao realizar login com Google: ' + error.message, 3000, 'danger');
      });
  }
  
  goToTab1() {
    this.router.navigate(['/tabs']);
  }

  cancel() {
    this.modal?.dismiss(null, 'cancel'); // Fecha o modal
    this.limparCampos(); // Limpa o formulário de cadastro
  }

  limparCampos() {
    this.email = '';
    this.password = '';
    this.name = '';
    this.cpf = '';
  }

  openSignupModal() {
    this.modal?.present(); // Abre o modal de cadastro
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.presentToast(`Olá, ${ev.detail.data}! Cadastro confirmado.`, 3000, 'success');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  recoverPassword() {
    if (!this.isValidEmail(this.email)) {
      this.presentToast('Por favor, insira um endereço de e-mail válido.', 3000, 'warning');
      return;
    }

    firebase.auth().sendPasswordResetEmail(this.email).then(() => {
      this.presentToast('Um e-mail de redefinição de senha foi enviado para você!', 3000, 'success');
    }).catch(error => {
      let errorMessage = "";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "E-mail inválido.";
          break;
        case 'auth/user-not-found':
          errorMessage = "Nenhum usuário encontrado com esse e-mail.";
          break;
        default:
          errorMessage = "Ocorreu um erro. Tente novamente.";
      }
      this.presentToast(errorMessage, 3000, 'danger');
    });
  }

  // Método para validar o formato do e-mail
  isValidEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
