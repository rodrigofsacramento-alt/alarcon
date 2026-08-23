export const generateProposalHtml = (data: any, lead: any) => {
    const totalItems = data.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const total = totalItems + Number(data.freight);
  
    const isExaustor = lead.product && lead.product.toLowerCase().includes('exaustor');
    const badgeHtml = isExaustor 
      ? `<span class="badge" style="background: #eff6ff; color: #2563eb; border-color: #bfdbfe;">Desmontado/Embalado</span>` 
      : '';
  
    const itemsHtml = data.items.map((item: any) => `
        <tr>
            <td>${item.quantity}</td>
            <td>
                <span class="item-name">${item.name}</span>
                <span class="badge highlight">${isExaustor ? 'Exaustor' : 'Drywall'}</span>
                ${badgeHtml}
            </td>
            <td class="text-right">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</td>
            <td class="text-right">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</td>
        </tr>
    `).join('');
  
    const freightHtml = data.freight > 0 ? `
        <tr>
            <td>1</td>
            <td>
                <span class="item-name">FRETE / ENTREGA</span>
                <span class="badge">Logística</span>
            </td>
            <td class="text-right">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.freight)}</td>
            <td class="text-right">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.freight)}</td>
        </tr>
    ` : '';
  
    const notesContent = data.notes ? data.notes.replace(/\n/g, '<br>') : '- ENTREGA A COMBINAR<br>- EMITIR NOTA FISCAL: NÃO';
  
    return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Proposta Comercial - ${lead.company || 'Cliente'}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
          :root {
              --bg-base: #f8fafc;
              --bg-card: #ffffff;
              --primary: #2563eb;
              --primary-hover: #1d4ed8;
              --accent: #4f46e5;
              --text-primary: #0f172a;
              --text-secondary: #475569;
              --text-muted: #94a3b8;
              --border-color: #e2e8f0;
              --success: #059669;
              --success-bg: #d1fae5;
              --font-main: 'Inter', sans-serif;
              --radius-xl: 24px;
              --radius-lg: 16px;
              --radius-md: 12px;
              --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          /* --- CUSTOM CURSOR --- */
          .custom-cursor { position: fixed; top: 0; left: 0; width: 40px; height: 40px; border: 2px solid rgba(37, 99, 235, 0.5); border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%); transition: width 0.3s, height 0.3s, background-color 0.3s; mix-blend-mode: multiply; }
          .custom-cursor-dot { position: fixed; top: 0; left: 0; width: 8px; height: 8px; background-color: var(--primary); border-radius: 50%; pointer-events: none; z-index: 10000; transform: translate(-50%, -50%); transition: width 0.2s, height 0.2s; }
          .custom-cursor.hover { width: 60px; height: 60px; background-color: rgba(37, 99, 235, 0.1); border-color: rgba(37, 99, 235, 0.8); }
          .custom-cursor-dot.hover { width: 12px; height: 12px; }
          @media (max-width: 768px) { .custom-cursor, .custom-cursor-dot { display: none; } }
          
          body { font-family: var(--font-main); background-color: var(--bg-base); color: var(--text-primary); line-height: 1.6; -webkit-font-smoothing: antialiased; cursor: none; }
          .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
          .hero { position: relative; border-radius: var(--radius-xl); overflow: hidden; margin-bottom: 40px; box-shadow: var(--shadow-lg); display: flex; flex-direction: column; justify-content: center; min-height: 520px; }
          .hero-bg-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
          .hero-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 50%, rgba(15,23,42,0) 100%); z-index: 1; }
          .hero-content { position: relative; z-index: 2; padding: 48px; color: #ffffff; display: flex; flex-direction: column; }
          .hero-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 56px; }
          .logo-wrapper { background: rgba(255,255,255,0.95); padding: 12px 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: inline-block; }
          .brand-logo img { height: 40px; object-fit: contain; display: block; }
          .meta-tag { background: rgba(255,255,255,0.1); color: #ffffff; padding: 6px 16px; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(8px); }
          .hero h1 { font-size: 48px; font-weight: 800; line-height: 1.1; margin-bottom: 20px; color: #ffffff; letter-spacing: -1px; max-width: 700px; text-shadow: 0 4px 12px rgba(0,0,0,0.4); }
          .hero p.lead { font-size: 18px; color: #e2e8f0; max-width: 600px; margin-bottom: 48px; line-height: 1.6; }
          .client-card { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: var(--radius-lg); padding: 24px 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
          .client-block p { margin: 4px 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
          .client-block strong { color: #ffffff; display: block; margin-bottom: 8px; font-size: 16px; font-weight: 700; }
          .value-prop { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 48px; }
          .feature-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; text-align: center; box-shadow: var(--shadow-sm); }
          .feature-icon { width: 48px; height: 48px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--accent); }
          .feature-card h3 { font-size: 16px; margin-bottom: 8px; color: var(--text-primary); font-weight: 600; }
          .feature-card p { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
          .pricing-section { background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); padding: 40px; margin-bottom: 32px; box-shadow: var(--shadow-md); }
          .section-title { font-size: 24px; font-weight: 700; margin-bottom: 32px; color: var(--text-primary); display: flex; align-items: center; gap: 12px; }
          .section-title svg { color: var(--primary); }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); border-bottom: 2px solid var(--border-color); }
          td { padding: 20px 16px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: var(--text-secondary); }
          .item-name { font-weight: 600; color: var(--text-primary); display: block; margin-bottom: 6px; }
          .badge { display: inline-flex; align-items: center; padding: 4px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-right: 8px; border: 1px solid #e2e8f0; }
          .badge.highlight { background: var(--success-bg); color: var(--success); border: 1px solid #a7f3d0; }
          .text-right { text-align: right; }
          .summary-wrapper { display: flex; justify-content: flex-end; margin-top: 32px; }
          .summary-box { width: 380px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; }
          .summary-row { display: flex; justify-content: space-between; font-size: 15px; color: var(--text-secondary); margin-bottom: 12px; }
          .summary-row.total { margin-top: 16px; padding-top: 16px; border-top: 2px solid var(--border-color); font-size: 28px; font-weight: 800; color: var(--primary); align-items: center; }
          .cta-section { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
          .terms-box { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-sm); }
          .terms-box h4 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 16px; font-weight: 600; }
          .terms-list { list-style: none; }
          .terms-list li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; font-size: 14px; color: var(--text-secondary); }
          .terms-list li svg { width: 20px; height: 20px; color: var(--primary); flex-shrink: 0; margin-top: 2px; }
          .action-box { display: flex; flex-direction: column; justify-content: center; align-items: stretch; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: var(--radius-lg); padding: 32px; text-align: center; box-shadow: 0 10px 25px -5px rgba(37,99,235,0.4); }
          .action-box h3 { font-size: 20px; color: #fff; margin-bottom: 12px; font-weight: 700; }
          .action-box p { font-size: 13px; color: rgba(255,255,255,0.9); margin-bottom: 24px; }
          .btn { background: #fff; color: var(--primary); padding: 16px 24px; border-radius: var(--radius-md); font-weight: 700; font-size: 16px; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          @media print {
              body { background: #fff !important; }
              .container { padding: 0 !important; max-width: 100% !important; }
              .hero, .pricing-section, .terms-box { box-shadow: none !important; border-color: #ccc !important; }
              .action-box { display: none !important; }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <header class="hero">
              <img src="/Imagens_Indavent/hero_industrial_park_1780440570764.png" alt="Fundo Industrial" class="hero-bg-img">
              <div class="hero-overlay"></div>
              <div class="hero-content">
                  <div class="hero-header">
                      <div class="logo-wrapper">
                          <div class="brand-logo">
                              <img src="/Nova-Indavent-logo.webp" alt="Nova Indavent Logo">
                          </div>
                      </div>
                      <div class="meta-tag">Proposta ${data.propostaCodigo ? '#' + data.propostaCodigo : 'Comercial'}</div>
                  </div>
                  <h1>Tecnologia de Ventilação que Valoriza a sua Engenharia.</h1>
                  <p class="lead">Apresentamos a solução definitiva com foco na excelência arquitetônica e alta capacidade técnica para o seu galpão logístico.</p>
                  <div class="client-card">
                      <div class="client-block">
                          <p>PREPARADO PARA</p>
                          <strong>${lead.company || '{NOME_CLIENTE}'}</strong>
                          <span style="display:block; color: #cbd5e1; font-size: 14px;">CNPJ: ${lead.cnpj || 'Não informado'}<br>${data.contactName ? data.contactName + ' - ' : ''}${lead.phone || ''}</span>
                      </div>
                      <div class="client-block">
                          <p>CONDIÇÕES GERAIS</p>
                          <strong>Validade: ${data.validityDate ? new Date(data.validityDate).toLocaleDateString('pt-BR') : '{DATA}'}</strong>
                          <span style="display:block; color: #cbd5e1; font-size: 14px;">Pagamento: ${data.paymentMethod || 'A Combinar'}<br>Prazo de Entrega: ${data.deliveryDeadline || 'A Combinar'}</span>
                      </div>
                  </div>
              </div>
          </header>
          <section class="value-prop">
              <div class="feature-card">
                  <div class="feature-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                  <h3>Qualidade Superior</h3>
                  <p>Exaustores eólicos produzidos com alumínio e aço galvanizado de alta pureza, garantindo durabilidade máxima e zero manutenção ao seu galpão.</p>
              </div>
              <div class="feature-card">
                  <div class="feature-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                  <h3>Agilidade Técnica</h3>
                  <p>Processo de fabricação e despacho logístico otimizado para não atrasar a sua obra.</p>
              </div>
              <div class="feature-card">
                  <div class="feature-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                  <h3>Garantia Estendida</h3>
                  <p>Nossos sistemas de exaustão possuem validação aerodinâmica rigorosa para garantir extração máxima e extrema resistência a ventanias.</p>
              </div>
          </section>
          <section class="case-study-section" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 40px; margin-bottom: 32px; box-shadow: var(--shadow-md);">
              <h2 class="section-title" style="margin-bottom: 8px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l3-9 5 18 3-9h5"></path></svg>
                  Tecnologia Indavent na Prática
              </h2>
              <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;">Análise técnica comprovada de redução térmica e eficiência energética.</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                  <div style="background: #f8fafc; padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
                      <img src="/Imagens_Indavent/chamine_visual_only_1780440372043.png" alt="Diagrama Efeito Chaminé" style="width: 100%; border-radius: var(--radius-md); margin-bottom: 12px; border: 1px solid #e2e8f0;">
                      <p style="font-size: 14px; color: var(--text-secondary); margin: 0;"><strong style="color: var(--text-primary);">Efeito Chaminé Natural:</strong> Fluxo contínuo de renovação de ar sem uso de motores elétricos.</p>
                  </div>
                  <div style="background: #f8fafc; padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
                      <img src="/Imagens_Indavent/thermal_before_after_1780438918294.png" alt="Térmica Antes e Depois" style="width: 100%; border-radius: var(--radius-md); margin-bottom: 12px; border: 1px solid #e2e8f0;">
                      <p style="font-size: 14px; color: var(--text-secondary); margin: 0;"><strong style="color: var(--text-primary);">Análise Térmica:</strong> Redução drástica da temperatura interna no galpão logístico.</p>
                  </div>
                  <div style="background: #f8fafc; padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
                      <img src="/Imagens_Indavent/energy_icons_comparison_1780440689270.png" alt="Gráfico Ar Condicionado vs Exaustor" style="width: 100%; border-radius: var(--radius-md); margin-bottom: 12px; border: 1px solid #e2e8f0;">
                      <p style="font-size: 14px; color: var(--text-secondary); margin: 0;"><strong style="color: #ef4444;">Ar Condicionado</strong> vs <strong style="color: var(--success);">Exaustor:</strong> Evite passivos milionários de energia. O exaustor entrega conforto com custo zero (R$ 0,00).</p>
                  </div>
                  <div style="background: #f8fafc; padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
                      <img src="/Imagens_Indavent/drone_roof_exhausts_1780438766526.png" alt="Vista de Drone" style="width: 100%; border-radius: var(--radius-md); margin-bottom: 12px; border: 1px solid #e2e8f0;">
                      <p style="font-size: 14px; color: var(--text-secondary); margin: 0;"><strong style="color: var(--text-primary);">Escala de Implementação:</strong> Alta capacidade para grandes áreas, crescendo junto com a sua empresa como um parceiro estratégico.</p>
                  </div>
              </div>
          </section>
          <section class="pricing-section">
              <h2 class="section-title">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  Investimento do Projeto
              </h2>
              <table>
                  <thead>
                      <tr>
                          <th style="width: 10%;">Qt.</th>
                          <th style="width: 45%;">Produto / Especificação</th>
                          <th class="text-right" style="width: 20%;">Valor Unit.</th>
                          <th class="text-right" style="width: 25%;">Subtotal</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${itemsHtml}
                      ${freightHtml}
                  </tbody>
              </table>
              <div style="margin-top: 24px; margin-bottom: 24px; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 20px;">
                  <h4 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px; margin-top: -2px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Observações do Pedido
                  </h4>
                  <p style="font-size: 14px; color: var(--text-secondary); margin: 0;">${notesContent}</p>
              </div>
              <div class="summary-wrapper">
                  <div class="summary-box">
                      <div class="summary-row">
                          <span>Produtos</span>
                          <span>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalItems)}</span>
                      </div>
                      <div class="summary-row">
                          <span>Frete</span>
                          <span>${data.freight > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.freight) : 'Pendente de confirmação'}</span>
                      </div>
                      <div class="summary-row total">
                          <span>Total Geral</span>
                          <span>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                      </div>
                  </div>
              </div>
          </section>
          <section class="cta-section">
              <div class="terms-box">
                  <h4>Termos de Aceite</h4>
                  <ul class="terms-list">
                      <li>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          <span>A confirmação deste documento valida o pedido de separação no estoque e faturamento no prazo acordado.</span>
                      </li>
                      <li>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          <span>Cálculos de volumetria (cubagem) e agendamento de transportadora são concluídos no próximo passo (Fase 2).</span>
                      </li>
                  </ul>
              </div>
              <div class="action-box">
                  <h3>Pronto para iniciar?</h3>
                  <p>Clique abaixo para dar o aceite digital na proposta e reservar seus produtos.</p>
                  <button class="btn">Aprovar Projeto</button>
              </div>
          </section>
      </div>
      <div class="custom-cursor"></div>
      <div class="custom-cursor-dot"></div>
      <script>
          const cursor = document.querySelector('.custom-cursor');
          const cursorDot = document.querySelector('.custom-cursor-dot');
          document.addEventListener('mousemove', (e) => {
              cursor.style.left = e.clientX + 'px';
              cursor.style.top = e.clientY + 'px';
              cursorDot.style.left = e.clientX + 'px';
              cursorDot.style.top = e.clientY + 'px';
          });
          document.querySelectorAll('a, button, input, select, .feature-card, .btn').forEach(el => {
              el.addEventListener('mouseenter', () => {
                  cursor.classList.add('hover');
                  cursorDot.classList.add('hover');
              });
              el.addEventListener('mouseleave', () => {
                  cursor.classList.remove('hover');
                  cursorDot.classList.remove('hover');
              });
          });
      </script>
  </body>
  </html>
    `;
  };
