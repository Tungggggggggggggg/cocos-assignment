import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="relative h-[60vh] bg-gray-900 overflow-hidden">
         <Image 
            src="https://images.unsplash.com/photo-1441996675210-e58a937f1f57?q=80&w=2070&auto=format&fit=crop"
            alt="Fashion studio"
            fill
            className="object-cover opacity-50"
         />
         <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-6xl font-black text-white tracking-widest uppercase">Về Chúng Tôi</h1>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 italic">"Fashion that speaks without words."</h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          Được thành lập vào năm 2024, Fashion Hub không chỉ là một cửa hàng thời trang, mà là một trải nghiệm sống. Chúng tôi tin rằng mỗi bộ trang phục bạn mặc là một tuyên ngôn về cá tính và phong cách riêng biệt.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          Sứ mệnh của chúng tôi là mang đến những thiết kế Streetwear hiện đại, kết hợp giữa sự tối giản và tính ứng dụng cao, giúp bạn tự tin tỏa sáng ở bất cứ đâu.
        </p>
      </div>

      <div className="bg-gray-50 py-24">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
               <h3 className="text-xl font-bold mb-4 uppercase">Chất Lượng</h3>
               <p className="text-gray-500">Sử dụng nguồn vải Organic Cotton 100% thân thiện với làn da.</p>
            </div>
            <div>
               <h3 className="text-xl font-bold mb-4 uppercase">Sáng Tạo</h3>
               <p className="text-gray-500">Các mẫu thiết kế độc quyền, không pha trộn, đậm chất đường phố.</p>
            </div>
            <div>
               <h3 className="text-xl font-bold mb-4 uppercase">Dịch Vụ</h3>
               <p className="text-gray-500">Hỗ trợ đổi trả trong 30 ngày và giao hàng thần tốc.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
