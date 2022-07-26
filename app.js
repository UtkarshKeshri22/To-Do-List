//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _= require("lodash");
const mongoose=require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-utkarsh:Testing123@cluster0.raywxkq.mongodb.net/todolistDB");
const itemsSchema={
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Add items to your List!"
});
// const item2 = new Item({
//   name: "Hit the + button to add a new item."
// });
// const item3 = new Item({
//   name: "<-- Hit this to delete an item."
// });
// const defaultItems=[item1,item2,item3];
const defaultItems=[item1];
const ListSchema= {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", ListSchema);

app.get("/", function(req, res) {

 Item.find({}, function(err, foundItems){
   if(foundItems.length==0){
     Item.insertMany(defaultItems,function(err){
       if(err) console.log("error");
       else console.log("Successfully added");
     });
     res.redirect("/");
   } else{
     res.render("list", {listTitle: "To-Do List", newListItems: foundItems});
   }
 });

});
app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list= new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
      }
    }
  });
});

app.post("/", function(req, res){

   const itemName = req.body.newItem;
   const listName= req.body.list;

   const item = new Item({
     name: itemName
   });

  if(listName==="To-Do List"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundlist){
      foundlist.items.push(item);
       foundlist.save();
       res.redirect("/"+ listName);
    });
  }
});
app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName=="To-Do List"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully Deleted the item!");
        res.redirect("/");
      }
    });
  } else{
     List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err,foundlist){
      if(!err){
      res.redirect("/"+listName);
    }
  });
}


});



app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port ==""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
