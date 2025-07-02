using System.Net.Mail;
using System.Net;
using PowerVital.Models; // <-- Necesario para EmailService


namespace PowerVital.Models
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task EnviarCorreoAsync(string destinatario, string asunto, string mensaje)
        {
            var remitente = _config["Correo:Usuario"];
            var clave = _config["Correo:Clave"];

            using (var smtp = new SmtpClient("smtp.gmail.com", 587))
            {
                smtp.Credentials = new NetworkCredential(remitente, clave);
                smtp.EnableSsl = true;

                var mail = new MailMessage(remitente, destinatario, asunto, mensaje);
                await smtp.SendMailAsync(mail);
            }
        }
    }

}
