import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';  // Importa o AngularFireAuth
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';  // Importa o Router
import firebase from 'firebase/compat/app';
import { SessaoService } from './sessao.service'; // Importe o serviço de sessão
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn: boolean = false; // Estado inicial de loggedIn

  constructor(
    private toastController: ToastController, // Injeta o ToastController
    private afAuth: AngularFireAuth, 
    private router: Router,
    private firestore: AngularFirestore,
    private sessaoService: SessaoService
  ) { 
    // Verifica o estado de autenticação ao iniciar o serviço
    this.afAuth.authState.subscribe(user => {
      this.loggedIn = !!user; // Atualiza o estado baseado na presença do usuário
    });
  }

  // Função para exibir o Toast com cor dinâmica
  async presentToast(message: string, color: string = 'light'): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000, // Duração do toast (em milissegundos)
      position: 'bottom', // Posição do toast (bottom, top, middle)
      color: color, // Cor do toast (light, dark, success, danger, etc.)
    });
    toast.present();
  }

  async registrarUsuario(email: string, password: string, name: string, cpf: string): Promise<void> {
    if (!this.isValidEmail(email)) {
      this.presentToast('E-mail inválido. Por favor, verifique e tente novamente.', 'danger');
      return; // Não prossegue com o registro se o e-mail for inválido
    }
  
    if (!this.isValidCPF(cpf)) {
      this.presentToast('CPF inválido. Por favor, verifique e tente novamente.', 'danger');
      return; // Não prossegue com o registro se o CPF for inválido
    }
  
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      if (userCredential.user) {
        const uid = userCredential.user.uid;
        await this.firestore.collection('Usuários').doc(uid).set({
          name: name,
          cpf: cpf,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
  
        this.router.navigate(['/login']);
        this.presentToast('Cadastro bem-sucedido, agora faça seu login.', 'success');
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      this.presentToast('Erro ao registrar usuário. Tente novamente.', 'danger');
    }
  }
  
  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex para verificar o formato do e-mail
    return emailPattern.test(email);
  }

  isValidCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
  
    if (cpf.length !== 11) {
      return false;
    }
  
    const allDigitsSame = cpf.split('').every((digit) => digit === cpf[0]);
    if (allDigitsSame) {
      return false;
    }
  
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    firstDigit = firstDigit >= 10 ? 0 : firstDigit;
  
    if (firstDigit !== parseInt(cpf[9])) {
      return false;
    }
  
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    let secondDigit = 11 - (sum % 11);
    secondDigit = secondDigit >= 10 ? 0 : secondDigit;
  
    if (secondDigit !== parseInt(cpf[10])) {
      return false;
    }
  
    return true; // CPF é válido
  }

  async loginUsuario(email: string, password: string): Promise<any> {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);

      if (userCredential.user) {
        const uid = userCredential.user.uid;
        const userDoc = await this.firestore.collection('Usuários').doc(uid).get().toPromise();

        if (userDoc && userDoc.exists) {
          const usuarioData = userDoc.data();
          this.sessaoService.setUsuarioLogado(usuarioData); // Define os dados do usuário no SessaoService
          return usuarioData;
        } else {
          this.presentToast("Usuário não encontrado no Firestore.", 'warning');
          return null;
        }
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      this.presentToast("Erro ao fazer login. Tente novamente.", 'danger');
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.loggedIn; // Retorna o estado de login atual
  }
  
  async googleLogin() {
    try {
      await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      this.presentToast('Login com Google realizado com sucesso!', 'success');
      this.router.navigate(['/tabs']); // Navega para a página de tabs após o login
    } catch (error) {
      console.log('Falha no login:', error);
      this.presentToast('Falha no login com Google. Tente novamente.', 'danger');
    }
  }

  async logout() {
    await this.afAuth.signOut(); // Realiza o logout
    this.loggedIn = false; // Atualiza o estado de login
    this.router.navigate(['/login']); // Navega para a página de login
    this.presentToast('Você foi deslogado com sucesso.', 'success');
  }
}
