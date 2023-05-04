//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require("lodash");

let port = process.env.PORT || 3000
app.listen(port, ()=>{
console.log("server running on " + port)})


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemsSchema = {
  name: String,
  age: Number,
  review: Number
};
const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

async function connect() {
  await mongoose.connect('mongodb+srv://admin-haris:Test123@cluster0.m0ggsat.mongodb.net/toDoListDB');

  const item1 = new Item({
    name: "Welcome to your todolist!"
  });

  const item2 = new Item({
    name: "Hit the + button to add a new item.",
    age: 12
  });

  const item3 = new Item({
    name: "<-- Hit this to delete an item.",
    review: 10
  });

  defaultItems = [item1, item2, item3];
  if (defaultItems.length === 0) {
    await Item.insertMany(defaultItems);
  }
};


connect().catch(err => console.log(err));

app.get("/", async function (req, res) {
  const foundItems = await Item.find();
  if (foundItems.length === 0) {
    await Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  }
});



app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listTitleName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listTitleName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    const list = await List.findOne({ name: listTitleName });
    list.items.push(item);
    list.save();
    res.redirect("/" + listTitleName);

  }


});

app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const deletedList = req.body.deletedListName;

  if (deletedList === "Today") {
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");
  } else {
    await List.findOneAndUpdate({ name: deletedList }, { $pull: { items: { _id: checkedItemId } } });
    res.redirect("/" + deletedList);
  }
});



app.get("/:customListName", async function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  const listName = await List.findOne({ name: customListName });
  if (listName) {
    //Show the existing list
    res.render("list", { listTitle: listName.name, newListItems: listName.items });
  } else {
    // Create a new list
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    await list.save();
    res.redirect("/" + customListName);
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

 
