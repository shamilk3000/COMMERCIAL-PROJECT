const Category = require("../Models/categoryModel");
const hbs = require("hbs");

module.exports = {
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toDateString(); // Example: "Tue Jan 21 2025",
  },

  formatDate2:  (datetime) => {
    if (!datetime) return "";
    return new Date(datetime).toString().split("GMT")[0].trim();
 },

  eq: (a, b) => {
    return String(a) === String(b);
  },

  singleimageConver: (image) => {
    const base64Data = image.data.toString("base64");
    const mimeType = image.contentType;
    return `data:${mimeType};base64,${base64Data}`;
  },

  arrayImageConvert: (images) => {
    return images.map((image) => {
      const base64Data = image.data.toString("base64");
      const mimeType = image.contentType;
      return `data:${mimeType};base64,${base64Data}<split>`;
    });
  },

  includes: (array, value) => {
    if (!array) return false;
    if (typeof array === "string") {
      array = array.split(",").map((item) => item.trim());
    }
    return array.includes(value);
  },

  formatColors: (array) => {
    if (Array.isArray(array)) {
      return array
        .map(([key, value]) => `${key} : ${value}`) 
        .join(" / "); 
    }
    return ""; 
  },

  incrementTwoValue: (inc , value) => {
    return parseInt(inc) + parseInt(value) + 1;
  },

  increment: (value) => {
    return parseInt(value) + 1;
  },

  equals: (a, b, options) => {
    if (a == b) {
        return options.fn(this);  
    } else {
        return options.inverse(this);  
    }
  },

  generateStars: (rating) => {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0; 
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); 

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bi bi-star-fill"></i>';
    }

    if (halfStar) {
        stars += '<i class="bi bi-star-half"></i>';
    }

    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="bi bi-star"></i>';
    }
    

    return new hbs.handlebars.SafeString(stars); 
  },

  eqNum :  (a, b) => {
    return a == b;
  },

  gt: (a, b) => {
    return a > b;
  },

  gtN : (a, b) => {
   return Number(a) > Number(b); 
 },

  json : (context) => {
    return JSON.stringify(context);
  },

  isExpired: (dateString) => {
    let givenDate = new Date(dateString);
    let currentDate = new Date();
    return givenDate < currentDate; 
  },

  
  range: (start, end, options) => {
      let result = "";
      for (let i = start; i <= end; i++) {
          result += options.fn(i);
      }
      return result;
  },

  lt: (a, b) => {
    return a < b;
  },

  add: (a, b) => {
      return a + b;
  },

  subtract: (a, b) => {
      return a - b;
  },



}