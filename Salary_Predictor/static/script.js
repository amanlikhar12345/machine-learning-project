function predictSalary(){

let age=document.getElementById("age").value;

let experience=document.getElementById("experience").value;

if(age=="" || experience==""){

alert("Please fill all fields");

return;

}

let formData=new FormData();

formData.append("age",age);

formData.append("experience",experience);

fetch("/predict",{

method:"POST",

body:formData

})

.then(response=>response.json())

.then(data=>{

document.getElementById("result").innerHTML=
"Predicted Salary : ₹ "+data.salary;

});

}