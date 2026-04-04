-- Add content column for inline reading
ALTER TABLE books ADD COLUMN content LONGTEXT NULL AFTER preview_url;

-- ===== Chí Phèo (id=1) =====
UPDATE books SET content = '
<div class="book-content">

<div class="book-intro">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Nam_Cao.jpg/320px-Nam_Cao.jpg"
       alt="Chân dung Nam Cao" class="author-portrait" />
  <p class="intro-text">
    <strong>Chí Phèo</strong> (1941) là kiệt tác của nhà văn <strong>Nam Cao</strong> —
    tác phẩm hiện thực xuất sắc nhất của văn học Việt Nam trước 1945.
    Truyện phản ánh bi kịch của người nông dân bị xã hội tàn phá, đẩy vào con đường lưu manh
    và bị tước đoạt quyền làm người.
  </p>
</div>

<h2>I. Tiếng Chửi Giữa Làng Vũ Đại</h2>

<p>Hắn vừa đi vừa chửi. Bao giờ cũng thế, cứ rượu xong là hắn chửi. Bắt đầu hắn chửi trời.
Có hề gì? Trời có của riêng nhà nào? Rồi hắn chửi đời. Thế cũng chẳng sao: đời là tất cả
nhưng chẳng là ai. Tức mình, hắn chửi ngay tất cả làng Vũ Đại. Nhưng cả làng Vũ Đại ai cũng
nhủ: "Chắc nó trừ mình ra!" Không ai lên tiếng cả. Tức thật! Ờ! Thế này thì tức thật!
Tức chết đi được mất! Đã thế, hắn phải chửi cha đứa nào không chửi nhau với hắn. Nhưng
cũng không ai ra điều. Mẹ kiếp! Thế có phí rượu không? Thế thì có khổ hắn không?</p>

<p>Không biết từ lúc nào, không biết vì lý do gì, hắn cứ làm vậy mỗi khi say. Hắn say thì
hắn chửi. Hắn chửi thì không ai thèm chửi lại. Không ai thèm chửi lại, hắn càng chửi hăng
hơn. Hắn chửi như một người cô đơn giữa đám đông. Đám đông thì vẫn cứ kéo nhau đi.</p>

<h2>II. Gốc Tích Chí Phèo</h2>

<p>Hắn tên là Chí Phèo. Người ta gọi hắn như vậy từ lúc hắn còn nằm trong cái váy đụp bên
cái lò gạch bỏ không. Hắn là đứa con hoang. Anh đi thả ống lươn trông thấy hắn trần truồng
và xám ngắt trong một váy đụp để bên cái lò gạch bỏ không, anh rước về cho một người đàn bà
góa mù. Người đàn bà góa mù này bán hắn cho một bác phó cối không con. Khi bác phó cối mất,
hắn đi ở hết nhà này đến nhà khác.</p>

<p>Năm hắn hai mươi tuổi, hắn vào làm canh điền cho nhà Lý Kiến. Ngày ấy hắn hiền lành như
đất. Hắn chỉ dám nhìn trộm bà Ba — vợ lẽ Lý Kiến — từ xa, chứ không dám làm gì hơn. Một
hôm bà Ba gọi hắn vào bóp chân. Hắn bóp, rồi bà Ba cứ kéo tay hắn, hắn sợ mà càng bóp
mạnh hơn. Chính Lý Kiến đã ghen và bảo người đẩy hắn vào tù. Hắn đi tù không biết vì tội
gì.</p>

<div class="pull-quote">
  "Ai cho tao lương thiện? Làm thế nào cho mất được những vết mảnh chai trên mặt này?"
</div>

<h2>III. Ra Tù — Con Quỷ Dữ Làng Vũ Đại</h2>

<p>Hắn về. Hắn về làng Vũ Đại sau bảy tám năm trời đi tù. Hắn về khác, hắn về như một
con quỷ dữ. Cái đầu thì trọc lốc, cái răng cạo trắng hớn, cái mặt thì đen mà rất cơng cơng,
hai mắt gườm gườm trông gớm chết! Hắn mặc cái quần nái đen với cái áo tây vàng. Cái ngực
phanh, đầy những nét chạm trổ rồng phượng với một ông tướng cầm chùy, cả hai cánh tay cũng
thế. Trông gớm chết!</p>

<p>Hắn đến nhà Bá Kiến gây sự — Lý Kiến lúc đó đã lên làm Bá Kiến, cụ Bá. Trái với mong
đợi của hắn, cụ Bá không tống hắn vào tù nữa mà ân cần mời vào nhà, rót rượu, cho tiền.
Từ đó, Chí Phèo trở thành tay sai đắc lực của Bá Kiến — đâm thuê chém mướn, phá phách,
đòi nợ cho nhà Bá.</p>

<h2>IV. Thức Tỉnh — Thị Nở và Bát Cháo Hành</h2>

<p>Một đêm say, Chí Phèo nằm ngủ ngoài vườn chuối nhà Thị Nở. Thị Nở — người đàn bà xấu
ma chê quỷ hờn, lại "dở hơi" — ra đó rồi gặp hắn. Hắn ốm, Thị Nở mang cho hắn bát cháo
hành còn nóng hổi.</p>

<p>Hắn ăn. Hắn ngẫm nghĩ rồi hắn khóc. Lần đầu tiên từ khi ra đời, có người quan tâm đến
hắn như vậy. Hắn cảm thấy mình còn là người. Hắn muốn lương thiện. Hắn nghĩ đến tương lai —
Thị Nở sẽ mở đường cho hắn. Hắn có thể trở thành người lương thiện nếu Thị Nở ưng thuận
sống với hắn.</p>

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Chi_pheo_illustration.jpg/480px-Chi_pheo_illustration.jpg"
     alt="Minh họa Chí Phèo và Thị Nở"
     onerror="this.style.display=''none''" />

<h2>V. Bi Kịch Cuối Đời</h2>

<p>Nhưng bà cô Thị Nở không cho phép. Thị Nở về nhà thưa chuyện với bà cô, bà cô mắng
xơi xơi, bảo rằng ai lại đi lấy một thằng chỉ phá với đâm thuê chém mướn như Chí Phèo.
Thị Nở về trả lại cho hắn tất cả những cái bát cháo hành hôm ấy bằng một câu nói lạnh
tanh, rồi quay đi.</p>

<p>Hắn uống rượu. Hắn uống mãi, uống mãi nhưng tỉnh hẳn ra. Hắn tức, hắn căm, hắn muốn
đến nhà bà cô Thị Nở. Nhưng hắn lại đến nhà Bá Kiến. Hắn vào, hắn chửi, hắn kêu rằng
hắn muốn làm người lương thiện. Rồi hắn đâm chết Bá Kiến và tự đâm mình chết.</p>

<p>Trước khi lịm đi, hắn nghe tiếng Thị Nở chạy đến. Hắn chỉ kịp nhìn cái lò gạch cũ
bỏ không nơi hắn được sinh ra...</p>

<div class="chapter-end">✦ Hết ✦</div>

</div>
' WHERE id = 1;

-- ===== Truyện Kiều (id=3) =====
UPDATE books SET content = '
<div class="book-content">

<div class="book-intro">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Nguyen_Du.jpg/320px-Nguyen_Du.jpg"
       alt="Chân dung Nguyễn Du" class="author-portrait" />
  <p class="intro-text">
    <strong>Truyện Kiều</strong> (hay <em>Đoạn Trường Tân Thanh</em>, ~1820) là đỉnh cao
    của văn học chữ Nôm Việt Nam, gồm 3.254 câu thơ lục bát của đại thi hào
    <strong>Nguyễn Du</strong> (1765–1820). Tác phẩm kể về cuộc đời truân chuyên của
    Thúy Kiều — người con gái tài sắc vẹn toàn nhưng bị số phận nghiệt ngã vùi dập
    suốt mười lăm năm lưu lạc.
  </p>
</div>

<h2>Phần I: Gặp Gỡ và Đính Ước</h2>

<div class="verse-block">
  <p>Trăm năm trong cõi người ta,<br>
  Chữ tài chữ mệnh khéo là ghét nhau.<br>
  Trải qua một cuộc bể dâu,<br>
  Những điều trông thấy mà đau đớn lòng.</p>

  <p>Lạ gì bỉ sắc tư phong,<br>
  Trời xanh quen thói má đào đánh ghen.<br>
  Cảo thơm lần giở trước đèn,<br>
  Phong tình cổ lục còn truyền sử xanh.</p>
</div>

<p>Thúy Kiều là chị, Thúy Vân là em. Hai nàng là con gái nhà họ Vương — một gia đình
trung lưu "êm đềm trướng rủ màn che". Cả hai đều tài sắc, nhưng mỗi người một vẻ.</p>

<div class="verse-block">
  <p>Đầu lòng hai ả tố nga,<br>
  Thúy Kiều là chị, em là Thúy Vân.<br>
  Mai cốt cách, tuyết tinh thần,<br>
  Mỗi người một vẻ, mười phân vẹn mười.</p>

  <p>Vân xem trang trọng khác vời,<br>
  Khuôn trăng đầy đặn, nét ngài nở nang.<br>
  Hoa cười, ngọc thốt, đoan trang,<br>
  Mây thua nước tóc, tuyết nhường màu da.</p>

  <p>Kiều càng sắc sảo, mặn mà,<br>
  So bề tài sắc lại là phần hơn.<br>
  Làn thu thuỷ, nét xuân sơn,<br>
  Hoa ghen thua thắm, liễu hờn kém xanh.</p>
</div>

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Thuy_kieu.jpg/480px-Thuy_kieu.jpg"
     alt="Tranh minh họa Thúy Kiều"
     onerror="this.style.display=''none''" />

<h2>Phần II: Bán Mình Chuộc Cha</h2>

<p>Trong tiết Thanh Minh, Kiều cùng hai em đi tảo mộ. Trên đường trở về, nàng gặp nấm mộ
hoang của Đạm Tiên — một kỹ nữ tài hoa bạc mệnh. Linh cảm trước số phận của mình,
Kiều khóc thương Đạm Tiên và gặp chàng Kim Trọng — người sau này trở thành người yêu đầu đời.</p>

<div class="verse-block">
  <p>Người quốc sắc, kẻ thiên tài,<br>
  Tình trong như đã, mặt ngoài còn e.<br>
  Chập chờn cơn tỉnh cơn mê,<br>
  Rốn ngồi chẳng tiện, dứt về chỉn khôn.</p>
</div>

<p>Hai người thề nguyện với nhau trước vầng trăng. Nhưng tai hoạ ập đến: cha và em trai Kiều
bị vu oan, bị bắt và bị đánh đập. Để có tiền lo lót, cứu cha và em, Kiều quyết định
bán mình vào lầu xanh.</p>

<div class="pull-quote">
  "Dù em nên vợ nên chồng,<br>
  Xót người mệnh bạc ắt lòng chẳng quên."
</div>

<p>Trước khi đi, nàng trao mối duyên cho Thúy Vân và nhờ em thay mình trả nghĩa Kim Trọng:</p>

<div class="verse-block">
  <p>Cậy em, em có chịu lời,<br>
  Ngồi lên cho chị lạy rồi sẽ thưa.<br>
  Giữa đường đứt gánh tương tư,<br>
  Keo loan chắp mối, tơ thừa mặc em.</p>
</div>

<h2>Phần III: Mười Lăm Năm Lưu Lạc</h2>

<p>Kiều rơi vào tay Tú Bà — chủ lầu xanh — và Mã Giám Sinh — kẻ mua nàng với một cái giá
lạnh lùng. Từ đó bắt đầu những năm tháng khổ đau: bị lừa, bị đánh, phải làm kỹ nữ,
rồi gặp Thúc Sinh, Từ Hải... mỗi lần tưởng tìm được bến bình yên, số phận lại đẩy nàng vào
vòng khổ mới.</p>

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Kieu.jpg/480px-Kieu.jpg"
     alt="Tranh Truyện Kiều cổ"
     onerror="this.style.display=''none''" />

<h2>Phần IV: Đoàn Tụ</h2>

<p>Sau mười lăm năm lưu lạc, Kiều được cứu thoát và trở về đoàn tụ với gia đình. Kim Trọng —
dù đã lấy Thúy Vân — vẫn nhớ thương Kiều nguyên vẹn. Hai người gặp lại nhau sau mười lăm
năm cách biệt.</p>

<div class="verse-block">
  <p>Duyên kia có hợp thì nên,<br>
  Nhân duyên ai lại đặt quyền cho ai?<br>
  Đã đành phận bạc như vôi,<br>
  Cũng liều nhắm mắt đưa tay vớ đỡ.</p>
</div>

<p>Tuy tái hợp nhưng Kiều xin được sống như em gái Kim Trọng, không muốn "đem thân ô uế"
lên bàn thờ thanh khiết của tình xưa. Kim Trọng và cả nhà đều đồng ý, họ sống bên nhau
trong tình cảm gia đình ấm áp.</p>

<div class="verse-block">
  <p>Hoa tàn mà lại thêm tươi,<br>
  Trăng tàn mà lại hơn mười rằm xưa.<br>
  Từ nay khép cửa phòng thu,<br>
  Chẳng tu thì cũng như tu mới là.</p>
</div>

<div class="chapter-end">
  ✦ Hết — Truyện Kiều, Nguyễn Du (~1820) ✦
</div>

</div>
' WHERE id = 3;
