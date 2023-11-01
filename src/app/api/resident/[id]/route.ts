import { endpoint } from "@/constraints/endpoints";
import { Resident } from "@/models/resident";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params } : {params: any}) {
    
   
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: endpoint.resident + "/" + params.id,
      headers: {
        // 'Authorization': "Bearer " + request.cookies.get("token")?.value,
        'Content-Type': 'application/json',
    },
    };  
   
    const response = await axios.request(config).then((response) => {
        console.log('hah')
      if (response.status == 200) {
        // cookies().set("token", response.data)
        console.log(response.data)
    
        return NextResponse.json(response.data
        //   , {
        //   status: 200,
        //   headers: { 'Set-Cookie': `token=${response.data.access_token}` },
        // }
        );
      }
    }).catch((error) =>{
      console.log(error)
      return NextResponse.json(error.response.data.message, { status: error.response.status, statusText: error.response.statusText })})
    return response;
  }

  export async function PATCH(request: NextRequest, { params } : {params: any}) {
    
    const data = await request.json();
    let config = {
      method: 'patch',
      maxBodyLength: Infinity,
      url: endpoint.resident + "/" + params.id ,
      headers: {
        // 'Authorization': "Bearer " + request.cookies.get("token")?.value,
         'Content-Type': 'application/json',
    },
    data:data
    };  
   
   
    const response = await axios.request(config).then((response) => {
      if (response.status == 200) {
        // cookies().set("token", response.data)
       // console.log(response.data)
        return NextResponse.json(response.data
        //   , {
        //   status: 200,
        //   headers: { 'Set-Cookie': `token=${response.data.access_token}` },
        // }
        );
      }
    }).catch((error) =>{
      console.log(error)
      return NextResponse.json(error.response.data.message, { status: error.response.status, statusText: error.response.statusText })})
    return response;
  }
  export async function DELETE(request: NextRequest, { params } : {params: any}) {
    
    
    let config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: endpoint.resident + "/" + params.id,
    };  
    const response = await axios.request(config).then((response) => {
      if (response.status == 200) {
        // cookies().set("token", response.data)
        return NextResponse.json(response.data
        //   , {
        //   status: 200,
        //   headers: { 'Set-Cookie': `token=${response.data.access_token}` },
        // }
        );
      }
    }).catch((error) =>{
      console.log(error)
      return NextResponse.json(error.response.data.message, { status: error.response.status, statusText: error.response.statusText })})
    return response;
  }