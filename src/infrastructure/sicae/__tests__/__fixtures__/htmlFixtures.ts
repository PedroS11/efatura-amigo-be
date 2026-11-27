export const FORM_HTML = `
  <html>
    <body>
      <form>
        <input type="hidden" name="__VIEWSTATE" value="abc123" />
        <input type="hidden" name="__EVENTVALIDATION" />
        <input type="hidden" value="ignored-no-name" />
      </form>
    </body>
  </html>
`;

export const VALID_RESULT_HTML = `
  <table id="ctl00_MainContent_ConsultaDataGrid">
    <tr class="gridHeader">
      <th>NIPC</th>
      <th>Firma</th>
      <th>CAE Principal</th>
      <th>CAEs Secundários</th>
    </tr>
    <tr>
      <td> 514852046 </td>
      <td>  Empresa Exemplo Lda  </td>
      <td>
        <div title="Atividades de consultoria">62020</div>
      </td>
      <td>
        <div title="Transporte ocasional">49330,</div>
        <div>70220,</div>
      </td>
    </tr>
  </table>
`;
