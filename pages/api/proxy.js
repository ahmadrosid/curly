import axios from 'axios'

export default function proxy(req, res) {
    axios(req.body)
        .then(response => {
            res.status(200).json(response.data)
        }).catch(err => {
            res.status(err.response?.status || 500)
            .json({
                error: err.message, ...err.response?.data
            })
        })
}
