const express=require("express");

const bodyparser=require("body-parser");

const mongoose=require("mongoose");

const _=require("lodash");

mongoose.set('strictQuery', false);

const app=express();

// let newitems=[];

// let workitems=[];

app.set("view engine","ejs");

app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://Yash_Kshatriya:Yash%402001@cluster0.osfzjak.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemSchema=new mongoose.Schema({
    name:String,
})

const listschema=new mongoose.Schema({
    name:String,
    arrayItems:[itemSchema],
})

const Item=new mongoose.model("Item",itemSchema); 
const List=new mongoose.model("List",listschema);


const item1=new Item({
    name:"Lets go for todays work",
})



const defaultitems=[item1];

app.get("/",function(req,res){
    Item.find({},function(err,founditems){

        // if(founditems.length==0){

        //     Item.insertMany(defaultitems,function(err){
        //         if(err){
        //             console.log(err);
        //         }else{
        //             console.log("Items added successfully");
        //         }
        //     });
        //     res.redirect("/")

        // }
        // else{
            res.render("list",{kindofday:"Today",newlistitems:founditems});
        // }
    })
    
})

app.get("/:customListName",function(req,res){

    const listname=_.capitalize(req.params.customListName);

    List.findOne({name:listname},function(err,foundlist){
        if(!foundlist){
            //create a new list
            const list=new List({
                name:listname,
                arrayItems:defaultitems,
            })
            list.save();
            res.redirect("/"+req.params.customListName);
        }
        else{
            res.render("list",{kindofday:foundlist.name,newlistitems:foundlist.arrayItems});
        }
    })

    const newlist=new List({
        name:listname,
        items:defaultitems,
    })
    newlist.save();
})

app.post("/delete",function(req,res){

    const itemid=(req.body.checkbox);

    const listname=req.body.listname;


        if(listname=="Today"){
            Item.findByIdAndRemove(itemid,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Item deleted successfully");
                    res.redirect("/");
                }
           
            })
        }
       else{
        List.findOneAndUpdate({name:listname}, {$pull:{arrayItems:{_id:itemid}}}, function(err,foundlist){
            if(!err){
                res.redirect("/"+listname);
            }

        })

       }
});

app.post("/", function(req, res){
  
    const itemname = req.body.newitem;
    const listname = req.body.button;
    
    const temp=new Item({
      name:itemname,
    })

    if(listname=="Today"){

        temp.save();
        
        res.redirect("/");
    }
    else{
        List.findOne({name:listname},function(err,foundlist){
            foundlist.arrayItems.push(temp);
            foundlist.save();
            res.redirect("/"+listname);
        })
    }
    
  });





// app.post("/work",function(req,res){
//     let newitem=req.body.newitem;
//     workitems.push(newitem);
//     redirect("/work");
// })

let port=process.env.PORT;
if(port==null || port==""){
    port=3000;
}
app.listen(port,function(){
    console.log("server started at port 3000");
});
