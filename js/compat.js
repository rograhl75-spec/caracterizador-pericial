/* Aviso para navegador antigo (escrito em ES5 de propósito): se o app.js não conseguiu rodar
   (navegador sem suporte a ES2020, como Edge Legado ou iOS 13), mostra a mensagem em vez da tela em branco. */
window.addEventListener('load', function () {
  if (!window.__appOk) { var v = document.getElementById('velho'); if (v) v.hidden = false; }
});
