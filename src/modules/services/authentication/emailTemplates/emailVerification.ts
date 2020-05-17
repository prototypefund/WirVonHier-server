interface IVerificationEmailOptions {
  link: string;
}
export function getEmailVerificationBody(options: IVerificationEmailOptions): string {
  return `<!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>HändlerRegistrierung WirVonHier.net</title>
      <style>
        .cr_site {background-color:#fff;}
        .cr_header {background-color:#5f6db0;color:#fff;}
        .cr_body {background-color:#fff;color:#000;font-size:12px;padding: 24px;}
        .cr_page {border-color:#000;border-style:solid;border-width:0;width:640px;}
        .cr_site a {color:#0084ff;}
        .cr_site { background:#FFF;}
        .cr_header { background-color:#e8e8e8; padding: 24px; border-radius: 15px;}
        .cr_page {border-color:#000;border-style:solid;border-width:1px; width:640px;}
        .cr_page {border-color:#000;border-style:solid;border-width:1px;}
        .cr_font {font: normal 12px Arial, Helvetica, sans-serif;}
        
        .cr_header .logo {min-height:20px; }
        .cr_header_text p {display:block;margin:5;padding:5px;}
        
        .cr_ipe_item{ margin:1px 10px; padding:1px 10px; }
        .cr_ipe_item.inactive { display:none; }
        .cr_hr {background-color: #ccc;border:0;height: 1px;}
        
        .cr_button {border:0;border-radius:4px;cursor:pointer;display:inline-block;font-size:14px;font-style:normal;font-weight:bold;margin:5px;padding:4px 18px;text-align:center;text-decoration:none;white-space:nowrap;width:auto;}
        
        .imprint {font-size:0.8em;}
        .cr_captcha {padding-left: 130px;}
        .cr_ipe_item .itemname{display:block;float:left;margin:5px 0 0; width:120px;}
        .cr_ipe_item input[type="text"]{width:300px;}
        .cr_ipe_item textarea{width:300px;}
        .cr_ipe_item select{width:300px;}
        .cr_ipe_item p {margin:0;}
        
        .cr_ipe_item select { background:#FFF; border:1px solid #ccc; color:#333; margin:0;padding:5px 4px; padding:2px;}
        .cr_ipe_item textarea:focus, input[type="text"]:focus {border:1px solid #ababab;}
        .cr_ipe_item input, textarea{ border:1px solid #ccc; margin:2px; padding:3px;}
        .cr_ipe_item input.cr_ipe_checkbox, input.cr_ipe_radio { border:none; width:15px; }
        
        .cr_error {font-size:1.1em;padding:10px;}
        .clever_form_error { background-color: #f99; border:1px solid #f22 !important; color:#fff}
        .clever_form_note {background-color:#f2ecb5; color:#000;display:inline; font-size:12px !important; font-weight:bold;margin:26px 0 0 3px; padding: 2px 4px;position:absolute;  }
        
        .cr_site {background-color:#fff;}
        .cr_header {color:#000;}
        .cr_page {border-color:#000;border-style:solid;border-width:0;}
        .cr_site a {color:#0084ff;}
        p { text-align: left; line-height: 1.6; }
      </style>
    </head>
    <body>
      <table width="100%" style="margin-top: 30px;">
        <tr>
          <td align="center" class="cr_font">
            <table cellpadding="0" class="cr_page" cellspacing="0">
              <tr>
                <td align="center" class="cr_header cr_font">
                  <div class="logo" style="overflow:hidden;width:100%;max-width: 240px;">
                    <img style="margin: 0;" width="240px" src="https://test.wirvonhier.net/assets/imgs/logo/logo-schrift_512x203.png" align="center" border="0" alt="" hspace="15" vspace="15">
                  </div>
                </td>
              </tr>
              <tr>
                <td class="cr_body cr_font formbox" align="center">
                  <div id="editable_content" class="cr_font" >
                    <div id="3308416" rel="mce_text" class="cr_ipe_item ui-sortable">
                      <div class="mce_text">
                        <p>Lieber Händler,</p>
                        <br />
                        <p>Vielen Dank für Ihre Registrierung als Händler bei WirVonHier. Um Ihre Registrierung abzuschließen, klicken Sie bitte auf folgenden Link: 
                        </p>
                      </div>
                      <br style="clear:left;" />
                    </div>
                    <table style="margin-bottom: 16px;">
                      <tbody>
                        <tr>
                        <td>&nbsp;</td>
                        <td style="display: block; margin: 0 auto;">
                          <div style="margin: 0 auto;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td>
                                  <table border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                      <td align="center" style="margin: 0 auto !important; max-width: 200px; border-radius: 10px; color: #fff;" bgcolor="#5f6daf"><a href="${options.link}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; text-decoration: none;border-radius: 10px; padding: 12px 18px; display: inline-block;">Hier klicken</a></td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>
                        <td>&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>
                    <div id="3308416" rel="mce_text" class="cr_ipe_item ui-sortable">
                      <div class="mce_text">
                        <p>Im Anschluss daran können Sie Ihr Profil vervollständigen und ein erstes Video hochladen, um direkt mit bestehenden und neuen Kunden in Kontakt zu treten.</p>
                        <br />
                        <p>Herzliche Grüße</p>
                        <br />
                        <p>Ihr Team von WirVonHier</p>                        
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
