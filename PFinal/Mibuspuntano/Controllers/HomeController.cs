﻿using mibuspuntano.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Web;
using System.Web.Mvc;

namespace mibuspuntano.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Descripci&oacute;n de la aplicaci&oacute;n";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "";

            return View();
        }

        [HttpPost]
        public ActionResult Contact(FormContact form)
        {
            using (var smtp = new SmtpClient())
            {
                try
                {
                    using (var db = new MiBusPuntanoDbContext())
                    {
                        var query = new Query();
                        query.Name = form.Name;
                        query.Email = form.Email;
                        query.Subject = form.Subject;
                        query.Message = form.Message;

                        db.Queries.Add(query);
                        db.SaveChangesAsync();
                    }

                    var message = new MailMessage();
                    message.Subject = form.Subject;
                    message.Body = "<"+form.Message;
                    message.IsBodyHtml = true;
                    message.From = new MailAddress("admin@mibuspuntano.com", "Administracion de Mi Bus Puntano");

                    message.To.Add(new MailAddress(form.Email, form.Name));

                    smtp.Send(message);
                }
                catch (Exception)
                {
                }
            }

            ViewBag.SendMessage = "Hemos recibido su consulta, a la brevedad lo contactaremos";
            return View();
        }
        public ActionResult Map()
        {
            return View();
        }

    }
}