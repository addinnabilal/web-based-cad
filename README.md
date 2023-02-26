# web-based-cad

## Cara Menjalankan Program
1. Clone repository ini
2. Buka terminal dari folder repository di local
3. Ubah ke directory src dengan command ```cd src``` 
4. Jalankan program dengan ```py -m http.server```
5. Buka localhost:8000 di browser

## Manual
### Penggambaran Model
***Garis***
1. Pilih tombol garis di toolbar “Shapes”
2. Arahkan mouse ke canvas
3. Klik satu kali pada canvas
4. Geser mouse untuk membentuk garis
5. Klik satu kali lagi untuk mengakhiri penggambaran

***Persegi***
1. Pilih tombol persegi di toolbar “Shapes”
2. Arahkan mouse ke canvas
3. Klik satu kali pada canvas
4. Geser mouse untuk membentuk persegi
5. Klik satu kali lagi untuk mengakhiri penggambaran

***Persegi Panjang***
1. Pilih tombol persegi panjang di toolbar “Shapes”
2. Arahkan mouse ke canvas
3. Klik satu kali pada canvas
4. Geser mouse untuk membentuk persegi panjang
5. Klik satu kali lagi untuk mengakhiri penggambaran

***Polygon***
1. Pilih tombol polygon di toolbar “Shapes”
2. Arahkan mouse ke canvas
3. Buat minimal 3 titik sudut dengan melakukan klik kanan pada lokasi titik-titik sudut yang dipilih
4. Klik kanan untuk mengakhiri penggambaran


### Interaksi Model
***Pengubahan panjang garis***
1. Pilih tombol resize di toolbar “Tools”.
2. Drag and drop salah satu titik sudut garis yang hendak di-resize.
3. Panjang garis akan berubah sesuai perubahan titik sudut yang dipindahkan.
4. Dapat juga dilakukan perpindahan posisi titik sudut dengan cara yang sama.

***Pengubahan panjang sisi persegi***
1. Pilih tombol resize di toolbar “Tools”.
2. Drag and drop salah satu titik sudut persegi yang hendak di-resize.
3. Persegi akan di-resize sesuai perubahan titik sudut yang dipindahkan dengan mempertahankan kesebangunan persegi.


***Pengubahan panjang atau lebar persegi panjang***
1. Pilih tombol resize di toolbar “Tools”.
2. Klik persegi panjang yang hendak di-resize untuk mengaktifkan tombol resize width dan tombol resize height.
3. Pilih tombol resize height untuk hanya mengubah tinggi persegi panjang dan mengunci lebarnya. Pilih tombol resize width untuk hanya mengubah lebar persegi panjang dan mengunci tingginya. Jangan pilih keduanya untuk mengubah lebar dan tinggi persegi panjang secara bebas.
4. Drag and drop salah satu titik sudut persegi panjang yang hendak di-resize.
5. Persegi panjang akan di-resize sesuai perubahan titik sudut yang dipindahkan serta pilihan pengguna untuk mengubah panjang lebar, tinggi, atau keduanya.

***Penambahan titik sudut polygon***
1. Pilih model polygon dengan tombol select pada toolbar “Tools”.
2. Tekan tombol “+” pada toolbar “Vertices”.
3. Arahkan mouse ke lokasi titik sudut yang akan ditambahkan di canvas.
4. Klik pada lokasi tersebut.
5. Deselect tombol “+” untuk mengakhiri penambahan sudut.


***Pengurangan titik sudut polygon***
1. Pilih model polygon dengan tombol select pada toolbar “Tools”.
2. Tekan tombol “-” pada toolbar “Vertices”.
3. Klik titik sudut yang akan dihapus.
4. Deselect tombol “-” untuk mengakhiri pengurangan sudut.


***Mengubah warna model***
1. Pilih tombol color di toolbar “Tools”.
2. Pilih warna yang dikehendaki di toolbar “Color”.
3. Klik salah satu titik sudut pada model untuk mengubah warna titik sudut, atau klik salah satu model untuk mengubah warna model tersebut (semua titik sudut).

***Translasi***
1. Pilih tombol  pada toolbar “Tools”
2. Lakukan drag and drop pada suatu shape yang dipilih untuk melakukan translasi.

***Rotasi***
1. Pilih model dengan tombol select pada toolbar “Tools”.
2. Gerakkan slider pada toolbar “Rotate” ke sudut yang dikehendaki.

***Menggerakkan titik sudut***
1. Pilih tombol  pada toolbar “Tools”
2. Lakukan drag and drop pada suatu titik sudut dari suatu shape untuk menggerakan titik sudut tersebut.

***Save***
1. Pilih tombol save yang terletak di sebelah kanan toolbar
2. Pengguna dapat mengganti nama file dan juga lokasi penyimpanan
3. Klik OK dan file akan disimpan dengan format JSON.

***Load***
1. Pilih tombol load yang terletak di sebelah kanan toolbar
2. Pengguna dapat memilih file hasil dari save sebelumnya
3. Klik OK dan canvas akan me-load dari file.

***Animasi***
1. Pilih model dengan tombol select pada toolbar “Tools”.
2. Tekan tombol “Animate”.
