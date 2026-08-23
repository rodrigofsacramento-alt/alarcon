import fs from "fs";
import { execSync } from "child_process";

const files = [
  "./01_FRONTEND_PRODUCAO_HOSTINGER_BKP/assets/Atendimento-DcqAjCvf.js",
  "./crm-imobiliaria-producao-BKP/assets/Atendimento-DcqAjCvf.js"
];

const modalComponent = `
function ImageViewerModal(){
  const[t,n]=i.useState(null),
       [r,o]=i.useState(1),
       [s,a]=i.useState({x:50,y:50});

  i.useEffect(()=>{
    const l=d=>{if(d.detail&&d.detail.src){n(d.detail);o(1);a({x:50,y:50});}};
    const c=d=>{if(d.key==="Escape"){n(null);o(1);}};
    const g=d=>{
      const m=d.target.closest("img");
      if(m&&m.src&&m.src.includes("supabase.co")&&!m.closest(".no-zoom")&&!m.closest("button")&&!m.classList.contains("rounded-full")){
        d.preventDefault();
        d.stopPropagation();
        n({src:m.src,alt:m.alt||"Imagem"});
        o(1);
        a({x:50,y:50});
      }
    };
    window.addEventListener("openImageViewer",l);
    window.addEventListener("keydown",c);
    document.addEventListener("click",g,true);
    return ()=>{
      window.removeEventListener("openImageViewer",l);
      window.removeEventListener("keydown",c);
      document.removeEventListener("click",g,true);
    };
  },[]);

  if(!t)return null;

  const u=l=>{
    const c=l.currentTarget.getBoundingClientRect();
    const d=((l.clientX-c.left)/c.width)*100;
    const p=((l.clientY-c.top)/c.height)*100;
    a({x:d,y:p});
  };

  const m=l=>{
    l.preventDefault();
    if(l.deltaY<0){o(c=>Math.min(c+0.25,4));}else{o(c=>Math.max(c-0.25,1));}
  };

  const h=()=>o(l=>Math.min(l+0.5,4));
  const f=()=>o(l=>Math.max(l-0.5,1));
  const y=()=>{n(null);o(1);};

  return e.jsxs("div",{
    id:"apex-image-modal",
    style:{position:"fixed",inset:0,zIndex:999999,display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",padding:"24px",userSelect:"none"},
    onClick:y,
    children:[
      e.jsxs("div",{
        style:{position:"absolute",top:"20px",right:"20px",zIndex:1000000,display:"flex",alignItems:"center",gap:"8px",backgroundColor:"rgba(15,23,42,0.95)",border:"1px solid rgba(51,65,85,0.8)",borderRadius:"9999px",padding:"6px 14px",boxShadow:"0 20px 25px -5px rgba(0,0,0,0.5)",backdropFilter:"blur(12px)"},
        onClick:l=>l.stopPropagation(),
        children:[
          e.jsx("span",{style:{fontSize:"12px",fontWeight:600,color:"#cbd5e1",padding:"0 6px"},children:Math.round(r*100)+"%"}),
          e.jsx("button",{
            type:"button",
            onClick:f,
            title:"Diminuir Zoom (-)",
            disabled:r<=1,
            style:{padding:"6px",borderRadius:"9999px",color:"#f8fafc",backgroundColor:"transparent",border:"none",cursor:r<=1?"not-allowed":"pointer",opacity:r<=1?0.3:1},
            children:e.jsxs("svg",{style:{width:"20px",height:"20px"},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:[
              e.jsx("circle",{cx:"11",cy:"11",r:"8",strokeWidth:"2"}),
              e.jsx("line",{x1:"21",y1:"21",x2:"16.65",y2:"16.65",strokeWidth:"2"}),
              e.jsx("line",{x1:"8",y1:"11",x2:"14",y2:"11",strokeWidth:"2"})
            ]})
          }),
          e.jsx("button",{
            type:"button",
            onClick:h,
            title:"Aumentar Zoom (+)",
            disabled:r>=4,
            style:{padding:"6px",borderRadius:"9999px",color:"#f8fafc",backgroundColor:"transparent",border:"none",cursor:r>=4?"not-allowed":"pointer",opacity:r>=4?0.3:1},
            children:e.jsxs("svg",{style:{width:"20px",height:"20px"},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:[
              e.jsx("circle",{cx:"11",cy:"11",r:"8",strokeWidth:"2"}),
              e.jsx("line",{x1:"21",y1:"21",x2:"16.65",y2:"16.65",strokeWidth:"2"}),
              e.jsx("line",{x1:"11",y1:"8",x2:"11",y2:"14",strokeWidth:"2"}),
              e.jsx("line",{x1:"8",y1:"11",x2:"14",y2:"11",strokeWidth:"2"})
            ]})
          }),
          e.jsx("div",{style:{width:"1px",height:"18px",backgroundColor:"#334155",margin:"0 4px"}}),
          e.jsx("button",{
            type:"button",
            onClick:y,
            title:"Fechar (Esc)",
            style:{padding:"6px",borderRadius:"9999px",color:"#f8fafc",backgroundColor:"transparent",border:"none",cursor:"pointer"},
            children:e.jsxs("svg",{style:{width:"20px",height:"20px"},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:[
              e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18",strokeWidth:"2"}),
              e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18",strokeWidth:"2"})
            ]})
          })
        ]
      }),
      e.jsx("div",{
        style:{position:"relative",maxWidth:"85vw",maxHeight:"82vh",overflow:"hidden",borderRadius:"16px",border:"1px solid rgba(51,65,85,0.7)",backgroundColor:"rgba(2,6,23,0.9)",boxShadow:"0 25px 50px -12px rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:"8px",cursor:"crosshair"},
        onClick:l=>l.stopPropagation(),
        onMouseMove:u,
        onWheel:m,
        children:e.jsx("img",{
          src:t.src,
          alt:t.alt||"Imagem ampliada",
          style:{maxWidth:"100%",maxHeight:"76vh",objectFit:"contain",borderRadius:"12px",transition:"transform 0.12s ease-out",transform:"scale("+r+")",transformOrigin:s.x+"% "+s.y+"%"}
        })
      })
    ]
  });
}
`;

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, "utf8");

    // 1. Insert ImageViewerModal right after the last import
    const lastImportIdx = content.lastIndexOf("import");
    const lastImportEnd = content.indexOf(";", lastImportIdx) + 1;
    content = content.substring(0, lastImportEnd) + "\n" + modalComponent + "\n" + content.substring(lastImportEnd);

    // 2. Render ImageViewerModal at root
    content = content.replace(
      `return e.jsxs("div",{className:"h-[100dvh] bg-background overflow-hidden flex flex-col",children:[`,
      `return e.jsxs("div",{className:"h-[100dvh] bg-background overflow-hidden flex flex-col",children:[e.jsx(ImageViewerModal,{}),`
    );

    // 3. Image click handler with zoom preview indicator
    const oldImg = `if(a==="image"||s.startsWith("[Imagem]")){const n=s.match(/https?:\\/\\/[^\\s]+/g);if(n){const d=n[0];return e.jsx("div",{className:"rounded-lg overflow-hidden border border-border max-w-[300px] bg-muted/20",children:e.jsx("img",{src:d,alt:"Imagem",className:"w-full h-auto object-contain max-h-[200px] hover:scale-[1.02] transition-transform duration-200"})})}}`;
    const newImg = `if(a==="image"||s.startsWith("[Imagem]")){const n=s.match(/https?:\\/\\/[^\\s]+/g);if(n){const d=n[0];return e.jsx("div",{className:"rounded-lg overflow-hidden border border-border max-w-[300px] bg-muted/20 cursor-zoom-in group relative",onClick:()=>window.dispatchEvent(new CustomEvent("openImageViewer",{detail:{src:d,alt:"Imagem"}})),children:[e.jsx("img",{src:d,alt:"Imagem",className:"w-full h-auto object-contain max-h-[200px] group-hover:scale-[1.02] transition-transform duration-200"}),e.jsx("div",{className:"absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none",children:e.jsx("span",{className:"bg-black/75 text-white text-[10px] font-medium px-2 py-1 rounded-md shadow backdrop-blur-sm",children:"🔍 Clique para ampliar"})})]})}}`;
    content = content.replace(oldImg, newImg);

    // 4. Rich cards for group invites & locations
    const oldTextEnd = `return e.jsx("p",{className:"text-sm whitespace-pre-line leading-relaxed break-words [overflow-wrap:anywhere]",children:s})},Ye=s=>{`;
    const newTextEnd = `if(s.includes("chat.whatsapp.com/")||s.startsWith("📩")||s.includes("[Convite de Grupo")){const linkMatch=s.match(/https?:\\/\\/chat\\.whatsapp\\.com\\/[A-Za-z0-9_-]+/);const linkUrl=linkMatch?linkMatch[0]:"#";const groupTitle=s.match(/\\[Convite de Grupo:?\\s*\"?([^\"]+)\"?\\]/);const name=groupTitle?groupTitle[1]:"Grupo do WhatsApp";return e.jsxs("div",{className:"rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 space-y-2.5 max-w-sm",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm",children:"👥"}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400",children:"Convite para Grupo de WhatsApp"}),e.jsx("p",{className:"text-sm font-bold text-foreground truncate",children:name})]})]}),e.jsxs("a",{href:linkUrl,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow transition-all active:scale-95",children:[e.jsx("span",{children:"Entrar no Grupo"}),e.jsx("span",{children:"→"})]})]});}if(s.startsWith("📍 [Localização")||s.includes("maps.google.com")){const linkMatch=s.match(/https?:\\/\\/maps\\.google\\.com[^\\s]+/);const linkUrl=linkMatch?linkMatch[0]:"#";return e.jsxs("div",{className:"rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-3 space-y-2 max-w-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-base",children:"📍"}),e.jsx("span",{className:"text-xs font-semibold text-blue-800 dark:text-blue-300",children:"Localização Compartilhada"})]}),e.jsx("a",{href:linkUrl,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center justify-center gap-2 w-full px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow",children:"Abrir no Google Maps ↗"})]});}return e.jsx("p",{className:"text-sm whitespace-pre-line leading-relaxed break-words [overflow-wrap:anywhere]",children:s})},Ye=s=>{`;
    content = content.replace(oldTextEnd, newTextEnd);

    // 5. Replace uo component with search bar (Print 2)
    const uoOldStart = "function uo({conversation:s,onSelectParticipant:a}){";
    const uoOldEnd = ']})})]})]})}const xo=s=>{';
    const uoStartIdx = content.indexOf(uoOldStart);
    const uoEndIdx = content.indexOf(uoOldEnd);

    if (uoStartIdx !== -1 && uoEndIdx !== -1) {
      const newUoCode = `function uo({conversation:s,onSelectParticipant:a}){
  var g,w,f,S,A;
  const[l,n]=i.useState([]),
       [d,p]=i.useState(!0),
       [searchTerm,setSearchTerm]=i.useState("");

  i.useEffect(()=>{(async()=>{
    var z;
    if(p(!0),!!((z=s.client)!=null&&z.id))
      try{
        const{data:O,error:W}=await B.from("vw_group_participants").select("*").eq("group_id",s.client.id);
        O?n(O):console.log("Group participants table/view not ready yet");
      }catch(O){console.error(O)}finally{p(!1)}
  })()},[(g=s.client)==null?void 0:g.id]);

  const h=k=>k?k.substring(0,2).toUpperCase():"GP";

  const formatPhoneDisplay = (raw) => {
    if (!raw) return "";
    const clean = String(raw).replace(/\\D/g, "");
    if (clean.length >= 14 && !clean.startsWith("55")) return "";
    if (clean.startsWith("55") && clean.length >= 12) {
      const ddd = clean.substring(2, 4);
      const num = clean.substring(4);
      if (num.length === 9) return "+55 (" + ddd + ") " + num.substring(0, 5) + "-" + num.substring(5);
      if (num.length === 8) return "+55 (" + ddd + ") " + num.substring(0, 4) + "-" + num.substring(4);
    }
    return clean ? "+" + clean : "";
  };

  const filtered = l.filter(k => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const cleanQ = q.replace(/\\D/g, "");
    const name = (k.full_name || "").toLowerCase();
    const rawPhone = (k.phone || "").replace(/\\D/g, "");
    return name.includes(q) || (cleanQ && rawPhone.includes(cleanQ)) || (k.phone || "").toLowerCase().includes(q);
  });

  return e.jsxs("div",{className:"p-6 h-full flex flex-col",children:[
    e.jsxs("div",{className:"text-center mb-6",children:[
      e.jsxs(_e,{className:"h-20 w-20 mx-auto mb-3",children:[
        (w=s.client)!=null&&w.avatar_url?e.jsx(Ce,{src:s.client.avatar_url,alt:((f=s.client)==null?void 0:f.full_name)||"Grupo",className:"object-cover"}):null,
        e.jsx(ke,{className:"text-2xl bg-indigo-500 text-white",children:h((S=s.client)==null?void 0:S.full_name)})
      ]}),
      e.jsx("h3",{className:"font-semibold text-lg text-foreground",children:((A=s.client)==null?void 0:A.full_name)||"Grupo Sem Nome"}),
      e.jsx("p",{className:"text-sm text-muted-foreground",children:"Grupo de WhatsApp"}),
      e.jsxs("div",{className:"flex items-center justify-center gap-2 mt-3",children:[
        e.jsxs(U,{variant:"outline",className:"text-[10px] bg-indigo-50 text-indigo-600 border-indigo-200",children:[l.length," Participantes"]}),
        e.jsx(U,{variant:"outline",className:"text-[10px]",children:s.status==="open"?"Atendimento Ativo":"Atendimento Encerrado"})
      ]}),
      e.jsx("div",{className:"flex items-center justify-center gap-3 mt-4",children:
        e.jsxs(m,{variant:"outline",size:"sm",className:"gap-1 text-xs",onClick:()=>{var k,z;return window.open("https://wa.me/"+((z=(k=s.client)==null?void 0:k.phone)==null?void 0:z.replace(/\\D/g,"")),"_blank")},children:[
          e.jsx(Oe,{className:"h-3 w-3"})," Abrir WhatsApp"
        ]})
      })
    ]}),
    e.jsxs("div",{className:"rounded-lg border bg-muted/30 flex-1 flex flex-col overflow-hidden",children:[
      e.jsxs("div",{className:"p-3.5 border-b bg-muted/50 space-y-2.5",children:[
        e.jsxs("div",{className:"flex items-center justify-between",children:[
          e.jsxs("h4",{className:"text-sm font-medium text-foreground flex items-center gap-2",children:[
            e.jsx(Le,{className:"h-3.5 w-3.5"})," Participantes do Grupo"
          ]}),
          e.jsx("span",{className:"text-[11px] text-muted-foreground font-medium",children:searchTerm ? filtered.length + " de " + l.length : l.length})
        ]}),
        e.jsxs("div",{className:"relative flex items-center",children:[
          e.jsx("span",{className:"absolute left-2.5 text-xs text-muted-foreground pointer-events-none",children:"🔍"}),
          e.jsx("input",{
            type:"text",
            value:searchTerm,
            onChange:ev=>setSearchTerm(ev.target.value),
            placeholder:"Buscar por nome ou telefone...",
            className:"w-full bg-background text-foreground text-xs pl-8 pr-7 py-1.5 rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-accent"
          }),
          searchTerm && e.jsx("button",{
            type:"button",
            onClick:()=>setSearchTerm(""),
            className:"absolute right-2 text-xs text-muted-foreground hover:text-foreground p-0.5",
            children:"✕"
          })
        ]})
      ]}),
      e.jsx("div",{className:"p-3 overflow-y-auto flex-1 space-y-2.5",children:
        d ? e.jsx("div",{className:"flex items-center justify-center py-6",children:e.jsx(fe,{className:"h-5 w-5 animate-spin text-muted-foreground"})})
          : filtered.length > 0 ? filtered.map(k=>{
              const formattedPhone = formatPhoneDisplay(k.phone);
              return e.jsxs("div",{className:"flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border",children:[
                e.jsxs("div",{className:"flex items-center gap-2 min-w-0 flex-1",children:[
                  e.jsxs(_e,{className:"h-8 w-8 shrink-0",children:[
                    k.avatar_url && e.jsx(Ce,{src:k.avatar_url}),
                    e.jsx(ke,{className:"text-[10px]",children:h(k.full_name)})
                  ]}),
                  e.jsxs("div",{className:"flex flex-col min-w-0",children:[
                    e.jsxs("span",{className:"text-xs font-medium text-foreground truncate",children:[
                      k.full_name || formattedPhone || "Sem Nome",
                      k.full_name && formattedPhone ? e.jsxs("span",{className:"text-[10px] font-normal text-muted-foreground ml-1 opacity-80",children:["(",formattedPhone,")"]}) : null
                    ]}),
                    e.jsx("span",{className:"text-[10px] text-muted-foreground",children:k.group_role==="admin"?"Administrador":"Membro"})
                  ]})
                ]}),
                e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[
                  k.lead_id ? e.jsx(U,{variant:"outline",className:"text-[9px] bg-green-50 text-green-700 border-green-200 shrink-0",children:"Lead"})
                            : e.jsx(U,{variant:"outline",className:"text-[9px] text-muted-foreground shrink-0",children:"Contato"}),
                  a && k.phone && e.jsx(m,{variant:"ghost",size:"icon",className:"h-7 w-7 text-accent hover:text-accent hover:bg-accent/10 rounded-full shrink-0",onClick:()=>a(k.profile_id,k.phone,k.full_name||""),title:"Conversa Privada",children:e.jsx(he,{className:"h-3.5 w-3.5"})})
                ]})
              ]},k.participation_id);
            })
          : e.jsxs("div",{className:"text-center py-6 text-sm text-muted-foreground",children:[
              e.jsx(Le,{className:"h-8 w-8 mx-auto mb-2 opacity-20"}),
              e.jsx("p",{children:searchTerm ? "Nenhum participante encontrado" : "Nenhum participante mapeado"}),
              e.jsx("p",{className:"text-xs mt-1",children:searchTerm ? "Tente buscar por outro nome ou número." : "O banco de dados de participantes ainda não foi populado."})
            ]})
      })
    ]})
  ]});
}`;
      content = content.substring(0, uoStartIdx) + newUoCode + content.substring(uoEndIdx + uoOldEnd.length - `const xo=s=>{`.length);
    }

    // 6. Dynamic is_group detection in filter and bypass action filter for grupos tab
    content = content.replace(
      `const r=t.whatsapp_contact&&((X=t.whatsapp_contact[0])==null?void 0:X.is_group)||((Z=t.client)==null?void 0:Z.is_group);`,
      `const r=Boolean(t.is_group||(t.whatsapp_contact&&t.whatsapp_contact[0]?.is_group)||t.client?.is_group||t.client?.phone?.startsWith("120363")||t.client?.phone?.includes("@g.us")||(t.client?.phone?.length>14&&!t.client?.phone?.startsWith("55"))||(t.tags&&Array.isArray(t.tags)&&t.tags.some(tag=>tag.includes("Lotes para brasileiros")||tag.includes("Rumo ao")||tag.includes("Grupo")))||(t.subject&&(t.subject.startsWith("WhatsApp - 120363")||t.subject.includes("@g.us")||t.subject.includes("Grupo"))));`
    );

    content = content.replace(
      `||f!=="all"&&((we=ft(t))==null?void 0:we.next_action)!==f)return!1;switch(g){case"grupos":return r===!0;`,
      `||(g!=="grupos"&&f!=="all"&&((we=ft(t))==null?void 0:we.next_action)!==f))return!1;switch(g){case"grupos":return r===!0;`
    );

    // 7. Remove ja.getState().openPanel calls in Atendimento.js
    content = content.replace(/ja\.getState\(\)\.openPanel\([^)]+\)/g, "undefined");

    fs.writeFileSync(file, content, "utf8");
    console.log("Transformed:", file);

    // Validate syntax
    execSync(`node --input-type=module --check < "${file}"`);
    console.log("✅ Syntax 100% VALID for:", file);
  }
}
