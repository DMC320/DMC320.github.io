document.addEventListener("DOMContentLoaded", () => {

const links = document.querySelectorAll("nav a");

links.forEach(link=>{

link.addEventListener("click",()=>{

links.forEach(l=>l.classList.remove("activo"));

link.classList.add("activo");

});

});

const cards=document.querySelectorAll(".card");

const observer=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("mostrar");

}

});

});

cards.forEach(card=>observer.observe(card));

});
