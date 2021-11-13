// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios'

export default async function handler(req, res) {

  const { dia } = req.body;

  const response = await axios.get(`https://servico.loteriafort.site/api/Resultado/${process.env.NEXT_PUBLIC_LOTERIA_KEY}/0/${dia}/${dia}`)
  
  res.status(200).json(response.data)
  
}
