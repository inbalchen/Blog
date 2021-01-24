var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

const port = 3000

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/restfull_blog_app", { useNewUrlParser: true });
app.use(methodOverride("_method"));
mongoose.set('useFindAndModify', false);
app.use(expressSanitizer());//after body-parser

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title: "Test Blog",
// 	image: "https://images.pexels.com/photos/1496183/pexels-photo-1496183.jpeg?auto=format%2Ccompress&cs=tinysrgb&dpr=2&w=500",
// 	body: "Hello, This is a blog test"
// });

//Restfull Routes
app.get("/", function(req,res){
	res.redirect("/blogs");
});

//index route
app.get("/blogs", function(req,res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		}else{
			res.render("index", {blogs:blogs});
		}
	});
});
//new route
app.get("/blogs/new", function(req,res){
	res.render("new");
});

//creat route
app.post("/blogs", function(req,res){
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}else{
			res.redirect("/blogs");
		}
	})
});

//show route
app.get("/blogs/:id", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show", {blog:foundBlog});
		}
	});
});

//edit route
app.get("/blogs/:id/edit", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit", {blog: foundBlog});
		}
	});
});

//update route
app.put("/blogs/:id", function(req,res){
	//sanitize <script> from text so that user cant change behavior
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});
//delete route
app.delete("/blogs/:id", function(req,res){

	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});

app.listen(port, function(){
	console.log("Listening on port: ", port);
});

