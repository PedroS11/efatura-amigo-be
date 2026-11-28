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

export const MULTIPLE_ROWS_HTML = `
  <table id="ctl00_MainContent_ConsultaDataGrid">
    <tr class="gridHeader"><th>Header</th></tr>
    <tr>
      <td>111111111</td>
      <td>First Company</td>
      <td><div title="Main 1">10000</div></td>
      <td></td>
    </tr>
    <tr>
      <td>222222222</td>
      <td>Second Company</td>
      <td><div title="Main 2">20000</div></td>
      <td></td>
    </tr>
  </table>
`;

export const MISSING_NAME_HTML = `
  <table id="ctl00_MainContent_ConsultaDataGrid">
    <tr>
      <td>514852046</td>
      <td>   </td>
      <td><div title="Main">62020</div></td>
      <td></td>
    </tr>
  </table>
`;

export const MISSING_CAE_HTML = `
  <table id="ctl00_MainContent_ConsultaDataGrid">
    <tr>
      <td>514852046</td>
      <td>Empresa Sem CAE</td>
      <td></td>
      <td></td>
    </tr>
  </table>
`;

export const COMPANY_NOT_FOUND_HTML = `
  <table id="ctl00_MainContent_ConsultaDataGrid">
    <tbody>
        <tr class="gridHeader">
            <td>NIPC</td>
            <td>Denominação Social/Firma</td>
            <td>CAE Principal</td>
            <td>CAEs Secundários</td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td class="upperFirma">
                <div title="Não existem dados para o critério de pesquisa indicado.">
                    Não existem dados para o critério de pesquisa indicado.
                </div>
            </td>
            <td>
                <div style="cursor: pointer" title=""></div>
            </td>
            <td class="centerCae">
                <div title=""></div>
                <div title=""></div>
                <div title=""></div>
            </td>
        </tr>
    </tbody>
</table>

`;
