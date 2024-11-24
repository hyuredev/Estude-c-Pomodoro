import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Certifique-se de importar o serviço de autenticação do Firebase
import { SessaoService } from '../services/sessao.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage {
  usuarioLogado: any;

  constructor(
    private afAuth: AngularFireAuth,
    private sessaoService: SessaoService,
    private router: Router) 
    {}

  ngOnInit(): void {
    // Inscreve-se no BehaviorSubject para obter os dados do usuário
    this.sessaoService.usuarioLogado$.subscribe(usuarioData => {
      this.usuarioLogado = usuarioData;
    });
  }


  logout() {
    this.afAuth.signOut().then(() => {
      // Após o logout, redireciona para a página inicial
      this.router.navigate(['/tabs']);
    }).catch(error => {
      console.error('Erro ao fazer logout:', error);
    });
  }

  goToTab1() {
    this.router.navigate(['/tabs']);
  }

}
