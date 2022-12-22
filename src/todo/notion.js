// const { Client } = require("@notionhq/client");
// require("dotenv").config();

import axios from 'axios';
axios.defaults.withCredentials=true
axios.defaults.crossDomain=true

const NOTION_KEY = 'secret_B4zoXAJSQizOaqiJvyIhyKOEoQJgRVfphnRJp78dw1q' // process.env.NOTION_KEY;
const NOTION_DB_ID = '5e90dc2e595144d9b7ee4a1e6b50a9d8' // process.env.NOTION_DB_ID;
// const NOTION_CURR_USER_ID = process.env.NOTION_CURR_USER_ID;

// const notion = new Client({ auth: NOTION_KEY });

let config = {
  method: 'post',
  url: `https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`,
  headers: { 
    'Notion-Version': '2022-06-28', 
    'Authorization': `Bearer ${NOTION_KEY}`,
    'Access-Control-Allow-Origin': '*'
  }
};
export function getAllItems() {
  return new Promise((resolve, reject) => {
    axios(config)
    .then(res => {
      const data = new Map();
      res?.results?.forEach((page) => {
        data.set(page.id, transformPageObject(page));
      });
    
      console.log(data);
    
      resolve([...data.values()])

    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  })
}

function transformPageObject(page) {
  return {
    id: page.id,
    title: page.properties.title.title[0].text.content,
    status: page.properties.status.status.name,
    type: page.properties.type.select.name,
    note: page.properties.note.rich_text[0]?.text.content,
    created_time: page.properties.created_time.created_time,
    alarm: page.properties.alarm.date?.start,
    deadline: page.properties.deadline.date?.start,
  };
}



// const express = require("express");
// const app = express();
// app.use(express.json());
// // const port = 3001;

// app.get("/", async (req, res) => {
//   try {
//     res.json({message: "connect node express"});
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });


// app.get("/notion/items", async (req, res) => {
//   try {
//     const items = await getAllItems();
//     res.json(items);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   }
// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

