// Tên file: api/scriptblox-proxy.js

module.exports = async (req, res) => {
    
    // URL API GỐC MỚI NHẤT
    const BASE_API_URL = 'https://scriptblox.com/api/script/search';

    const { url } = req;
    
    // 1. TẠO THAM SỐ TÌM KIẾM
    let queryParams = new URLSearchParams(url.split('?')[1] || '');

    // ĐẢM BẢO LUÔN CÓ THAM SỐ 'q' ĐƯỢC GỬI ĐI (để API gốc không trả về lỗi)
    if (!queryParams.has('q')) {
        queryParams.set('q', '');
    }

    const targetUrl = BASE_API_URL + '?' + queryParams.toString(); 

    // Thiết lập Header CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // GỌI API GỐC VỚI HEADER MẠNH MẼ ĐỂ CHỐNG BỊ CHẶN (LỖI 500)
        const response = await fetch(targetUrl, {
            headers: {
                // Giả lập trình duyệt chi tiết
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*', 
                'Referer': 'https://scriptblox.com/', // Bắt chước việc gọi từ trang chủ
                'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8', 
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty', // Thêm các header bảo mật của trình duyệt
                'Sec-Fetch-Mode': 'cors',
            }
        });
        
        // Kiểm tra lỗi HTTP từ API gốc
        if (!response.ok) {
            let errorBodyText = await response.text();
            
            res.status(500).json({ 
                error: `Upstream API Failed: ${response.status} ${response.statusText}`, 
                details: "API gốc đã từ chối yêu cầu. Có thể API đang bảo trì hoặc đã đổi cơ chế bảo mật (như Cloudflare/Captcha).",
                upstream_response_snippet: errorBodyText.substring(0, 200) + '...' 
            });
            return;
        }

        // Trả về dữ liệu JSON thành công
        const data = await response.json();
        res.status(200).json(data);
        
    } catch (error) {
        // Xử lý lỗi mạng hoặc lỗi Serverless Function nội bộ
        console.error('Proxy Fetch Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error during API fetch.', details: error.message });
    }
};
