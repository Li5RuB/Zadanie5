using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebApplication1.Models
{
    public class Post
    {
        [Key]
        public int Id { get; set; }
        public int El { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int Z { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
        public string CurrentText { get; set; }
    }
}
