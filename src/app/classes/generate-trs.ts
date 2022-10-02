export class GenerateTRS {
  html(detailProposal) {
    let html = '';
    html += `
    <html>
      <head>
        <title>TRS Proposal - ${detailProposal.program_code}</title>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
        <style type="text/css">
          @media print {
            body {
               -webkit-print-color-adjust: exact;
            }
          }
          :root {
            --bleeding: 0cm;
            --margin: 00.5cm;
          }
      
          @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0 auto;padding:0;background:#ccc;display:flex;flex-direction:column}.page{display:inline-block;position:relative;height:297mm;width:210mm;font-size:12pt;margin:2em auto;box-shadow:0 0 .5cm rgba(0,0,0,.5);background:#fff}@media screen{.page::after{position:absolute;content:'';top:0;left:0;width:calc(100% - var(--bleeding) * 2);height:calc(100% - var(--bleeding) * 2);margin:var(--bleeding);outline:black dashed thin;pointer-events:none;z-index:9999}}@media print{.page{margin:0;overflow:hidden}}
      
          .page{
            border: 2px solid;
            font-family: Helvetica, sans-serif;
          }
      
          .title{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 150px;
            text-align: center;
            line-height: 33px;
            font-size: 22px;
            font-weight: bold;
          }
      
          .tipe1_title{
            background-color: #777 !important;
            padding: 10px;
            color: #fff !important;
            font-size: 19px;
            font-weight: bold;
          }
      
          .row {
            display: flex;
            margin: 20px;
          }
      
          .kiri {
            flex: 30%;
          }
      
          .kanan {
            flex: 70%;
          }
      
          .kiri,.kanan{
            font-size: 17px;
            line-height: 25px;
          }
      
          .abu1{
            background: #ccc !important;
          }
      
          .abu2{
            background: #eee !important;
          }
      
          .abu1,.abu2{
            padding: 8px;
            font-size: 18px;
          }
      
          .textarea {
            border: 1px solid #222;
            background: #eee !important;
            padding: 5px;
            font-size: 15px;
            height: 150px;
          }

          .jumbo{
            font-size: 60px;
            text-align: center;
          }
        </style>
      </head>
      
      <body onload="load()">
        <div class="page">
          <div class="title">
            Proposal<br />
            Tactical Retail Sales Activity
          </div>
          <div class="tipe1">
            <div class="tipe1_title">PIC TRS</div>
            <div class="row">
              <div class="kiri">
                Area Name<br />
                Sales Office<br />
                Created by<br />
                Last Modified by
              </div>
              <div class="kanan">
                : ${detailProposal.area_name}<br />
                : ${detailProposal.salespoint_name}<br />
                : ${detailProposal.created_by} (${detailProposal.created_at})<br />
                : ${detailProposal.updated}
              </div>
            </div>
          </div>
          <div class="tipe1">
            <div class="tipe1_title">PROGRAM</div>
            <div class="row">
              <div class="kiri">
                Program Code<br />
                Start Date<br />
                End Date
              </div>
              <div class="kanan">
                : ${detailProposal.program_code}<br />
                : ${detailProposal.start_date}<br />
                : ${detailProposal.end_date}
              </div>
            </div>
          </div>
          <div class="tipe1">
            <div class="tipe1_title">CUSTOMER</div>
            <div class="row">
              <div style="flex: 35%">
              <div class="abu1">${detailProposal.customer1_name}</div>
              <div class="abu2">${detailProposal.customer2_name}</div>
              </div>
              
              <div style="flex: 5%"></div>
              
              <div style="flex: 23%">
              <div class="abu1">${detailProposal.customer1_code}</div>
              <div class="abu2">${detailProposal.customer2_code}</div>
              </div>
              
              <div style="flex: 5%"></div>
              
              <div style="flex: 22%">
              <div class="abu1">${detailProposal.customer1_area}</div>
              <div class="abu2">${detailProposal.customer2_area}</div>
              </div>
            </div>
          </div>

          <div class="tipe1">
            <div class="tipe1_title">INFORMASI PROGRAM</div>
            <div class="row">
              <div style="flex: 50%">
                <div class="textarea" style="margin: 0 5px 10px 0;">
                  Background :<br />${detailProposal.background}
                </div>
                <div class="textarea" style="margin: 0 5px 10px 0;">
                  Jumlah Executor :
                  <div class="jumbo">${detailProposal.executors_count}</div>
                </div>
              </div>
              <div style="flex: 50%">
                <div class="textarea" style="margin: 0 0 10px 5px;">
                  Objective :<br />${detailProposal.objective}
                </div>
                <div class="textarea" style="margin: 0 0 10px 5px;">
                  Kecamatan :<br />
                  <ul>`;
                  
                  for (const obj of detailProposal.kecamatans) {
                    html += `<li>${obj.dati2} - ${obj.kecamatan}</li>`;
                  }
          
                  html += `
                  </ul>
                </div>
              </div>
            </div>
          </div>


        </div>
        <script>
          function load() { 
            setTimeout(function(){ 
              window.focus();
              window.print();
              window.close(); 
            }, 200); 
          }
        </script>
      </body>
    </html>`;

    return html;
  }
}