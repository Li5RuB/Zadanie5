using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApplication1.Data;
using WebApplication1.Models;

namespace WebApplication1.Hubs
{
    public class BoardHub : Hub
    {
        private ApplicationDbContext db;

        public BoardHub(ApplicationDbContext context)
        {
            db = context;
        }

        public async Task CreatePost(Post postint)
        {
            await this.Clients.All.SendAsync("CreatePost", postint);
            await db.Posts.AddAsync(postint);
            await db.SaveChangesAsync();
        }

        public async Task ChangePost(object[] idtext)
        {
            int el = int.Parse(idtext[0].ToString());
            await this.Clients.Others.SendAsync("ChangePost", idtext);
            var post = db.Posts.FirstOrDefault(t => t.El == el);
            post.CurrentText = idtext[1].ToString();
            await db.SaveChangesAsync();
        }

        public async Task ResizePost(object[] idtext)
        {
            int el = int.Parse(idtext[0].ToString());
            int w = int.Parse(idtext[1].ToString());
            int h = int.Parse(idtext[2].ToString());
            await this.Clients.Others.SendAsync("ResizePost", idtext);
            var post = db.Posts.FirstOrDefault(t => t.El == el);
            post.Width = w;
            post.Height = h;
            await db.SaveChangesAsync();
        }

        public async Task RemoveElem(object[] idtext)
        {
            await this.Clients.Others.SendAsync("RemoveElem", idtext);
            int id = int.Parse(idtext[0].ToString());
            switch (idtext[1].ToString())
            {
                case "Text":
                    var text = db.Texts.FirstOrDefault(t => t.El == id);
                    db.Texts.Remove(text);
                    await db.SaveChangesAsync();
                    break;
                case "Post":
                    var post = db.Posts.FirstOrDefault(t => t.El == id);
                    db.Posts.Remove(post);
                    await db.SaveChangesAsync(); 
                    break;
                case "Canvas":
                    var canvas = db.Canvases.FirstOrDefault(t=>t.El==id);
                    db.Canvases.Remove(canvas);
                    await db.SaveChangesAsync();
                    var curves = db.Curves.Where(t=>t.El==id);
                    db.Curves.RemoveRange(curves);
                    await db.SaveChangesAsync();
                    break;
            }
        }

        public async Task CreateText(Text text)
        {
            await this.Clients.All.SendAsync("CreateText", text);
            await db.Texts.AddAsync(text);
            await db.SaveChangesAsync();
        }

        public async Task ChangeText(object[] idtext)
        {
            int el = int.Parse(idtext[0].ToString());
            int z = int.Parse(idtext[2].ToString());
            await this.Clients.All.SendAsync("ChangeText", idtext);
            var text = db.Texts.FirstOrDefault(t => t.El == el);
            text.CurrentText = idtext[1].ToString();
            text.Z = z;
            await db.SaveChangesAsync();
        }

        public async Task Move(object[] position)
        {
            await this.Clients.Others.SendAsync("Move", position);
            int id = int.Parse(position[0].ToString());
            int x = int.Parse(position[1].ToString());
            int y = int.Parse(position[2].ToString());
            int z = int.Parse(position[3].ToString());
            switch (position[4].ToString())
            {
                case "Text":
                    var text = db.Texts.FirstOrDefault(t => t.El == id);
                    text.X = x;
                    text.Y = y;
                    text.Z = z;
                    await db.SaveChangesAsync();
                    break;
                case "Post":
                    var post = db.Posts.FirstOrDefault(t => t.El == id);
                    post.X = x;
                    post.Y = y;
                    post.Z = z;
                    await db.SaveChangesAsync();
                    break;
                case "Canvas":
                    var canvas = db.Canvases.FirstOrDefault(t => t.El == id);
                    var curves = db.Curves.Where(c => c.El == id);
                    int movex = (canvas.X - x)*(-1);
                    int movey = (canvas.Y - y)*(-1);
                    foreach (var item in curves)
                    {
                        item.startX += movex;
                        item.endX += movex;
                        item.startY += movey;
                        item.endY += movey;
                    }
                    await db.SaveChangesAsync();
                    canvas.X = x;
                    canvas.Y = y;
                    canvas.Z = z;
                    await db.SaveChangesAsync();
                    break;
            }
        }

        public async Task SendSignalCreateCanvas(int canvas)
        {
            await this.Clients.Others.SendAsync("ReceiveSignalCreateCanvas", canvas);
            var can = new Canvas() { El = canvas};
            await db.Canvases.AddAsync(can);
            await db.SaveChangesAsync();
        }
        public async Task SendLineValues(Curve curve ,object canvas)
        {
            await this.Clients.Others.SendAsync("ReceiveLine", curve, canvas);
            curve.El = int.Parse(canvas.ToString());
            await db.Curves.AddAsync(curve);
            await db.SaveChangesAsync();
        }
        public async Task ResizeCanvas(object canvas,int l, int t, int h, int w)
        {
            await this.Clients.Others.SendAsync("ReceiveResizeCanvas", canvas,l,t,h,w);
            var id = int.Parse(canvas.ToString());
            var can = db.Canvases.FirstOrDefault(c => c.El == id);
            can.X = l;
            can.Y = t;
            can.Height = h;
            can.Width = w;
            await db.SaveChangesAsync();
        }
        public async Task Init(object obj)
        {
            var Posts = db.Posts;
            var Texts = db.Texts;
            var Curves = db.Curves;
            var Canvases = db.Canvases;
            foreach (var item in Posts)
            {
                await this.Clients.Caller.SendAsync("CreatePost",item);
            }
            foreach (var item in Texts)
            {
                await this.Clients.Caller.SendAsync("CreateText", item);
            }
            foreach (var item in Canvases)
            {
                await this.Clients.Caller.SendAsync("ReceiveSignalCreateCanvas", item.El);
            }
            foreach (var item in Curves)
            {
                await this.Clients.Caller.SendAsync("ReceiveLine", item, item.El);
            }
            foreach (var item in Canvases)
            {
                await this.Clients.Caller.SendAsync("ReceiveResizeCanvas", item.El, item.X, item.Y, item.Height, item.Width);
            }
        }
    }
}
