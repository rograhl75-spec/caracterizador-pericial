#!/usr/bin/env python3
# Gera dados/historico-nr.js a partir dos textos consolidados das NR-01, NR-15 e NR-16 (MTE).
import re,json,sys
# Uso: python3 scripts/gerar-historico-nr.py <nr01.txt> <nr15.txt> <nr16.txt>
# Os .txt saem de "pdftotext -layout" aplicado aos PDFs consolidados do MTE. Grava dados/historico-nr.js.
import os
A01,A15,A16=sys.argv[1:4]; R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
MES={'janeiro':1,'fevereiro':2,'março':3,'marco':3,'abril':4,'maio':5,'junho':6,'julho':7,'agosto':8,'setembro':9,'outubro':10,'novembro':11,'dezembro':12}
def chave(t):
    m=re.search(r'n[º°o]\s*\.?\s*([\d.]+),?\s+de\s+\d{1,2}\s+(?:de\s+|e\s+)?\w+\s+(?:\d\s+)?de\s+(\d{4})',t)
    return (str(int(m.group(1).replace('.',''))),m.group(2)) if m else None
def parse(txt, secre, nome):
    L=txt.replace('\f','\n').split('\n')
    # cabeçalho
    hdr=[]; i=0
    while i<len(L) and not re.match(r'^\s*(1\.1 |15\.1 |16\.1 |\(Redação|SUMÁRIO)',L[i]):
        m=re.match(r'^\s*(Portaria .+?)\s{2,}(\(Re[pv]\.\s*\)?)?\s*(\d\d/\d\d/\d\d)\s*$',L[i])
        if m: hdr.append({'port':m.group(1).strip(),'dou':m.group(3),'obs':(m.group(2) or '').replace(' ','')})
        i+=1
    # seções e anotações
    sec='Itens gerais'; ev=[]; ult=0
    flat=[]
    for l in L:
        m=re.match(secre,l)
        if m:
            num=m.group(1); ordem=int(re.match(r'\d+',num).group()) if num[0].isdigit() else {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'(*)':99}.get(num,0)
            if ordem>=ult: sec='Anexo '+num; ult=ordem  # anexo interno (ex.: Anexo nº 1 dentro do Anexo 12) fica no anexo principal
            continue
        flat.append((sec,l))
    # junta linhas por seção para pegar anotações quebradas
    buf=''; cur=None; blocos=[]
    for s,l in flat:
        if s!=cur and buf: blocos.append((cur,buf)); buf=''
        cur=s; buf+=' '+l.strip()
    blocos.append((cur,buf))
    for s,b in blocos:
        b=re.sub(r'\s+',' ',b)
        for m in re.finditer(r'\((Inserido|Inserida|Incluído|Incluída|Redação dada|Redação|Alterado|Alterada|Revogado|Aprovado|Acrescentado)\s+pela\s+(Portaria[^)]{5,160})\)(\s*\(Entra em vigor[^)]*\))?(\s*ANULADO POR DECISÃO JUDICIAL)?',b):
            k=chave(m.group(2))
            if not k: continue
            acao={'incluída':'incluído','inserida':'inserido','alterada':'alterado','redação':'redação dada'}.get(m.group(1).lower(),m.group(1).lower())
            extra=[]
            vig=re.search(r'entra em vigor a partir de ([^)]+)',m.group(0),re.I)
            if vig: extra.append('em vigor a partir de '+vig.group(1).strip(' -'))
            if m.group(4): extra.append('anulado por decisão judicial')
            ev.append({'nomep':re.sub(r',\s*de\s+\d.*$','',m.group(2)).strip()+'/'+k[1],'k':k,'sec':s,'acao':acao,'extra':'; '.join(extra)})
    for e in ev:
        if (nome,e['k'],e['acao'],e['sec']) in AJUSTE: e['sec']=AJUSTE[(nome,e['k'],e['acao'],e['sec'])]
    ev.extend(EXTRA.get(nome,[]))
    # agrega
    out=[]
    for h in hdr:
        k=chave(h['port'])
        onde=[]
        for e in ev:
            if e['k']==k:
                t=e['acao']+' — '+e['sec']+(' ('+e['extra']+')' if e['extra'] else '')
                if t not in onde: onde.append(t)
        out.append({'port':h['port'],'dou':h['dou'],'obs':h['obs'],'onde':onde})
    fora=[]
    hk=[chave(h['port']) for h in hdr]
    for e in ev:
        if e['k'] not in hk:
            t=e['acao']+' — '+e['sec']+(' ('+e['extra']+')' if e['extra'] else '')
            key=e.get('nomep') or ('Portaria nº '+e['k'][0]+'/'+e['k'][1])
            f=next((x for x in fora if x['port']==key),None)
            if not f: f={'port':key,'onde':[]}; fora.append(f)
            if t not in f['onde']: f['onde'].append(t)
    return {'nome':nome,'hist':out,'fora':fora}
# ajustes conferidos no texto: a anotação fica no fim do Anexo 13 (lista "Agentes biológicos"), mas o PDF repete "Operações diversas" depois do 13-A
AJUSTE={('NR-15',('12','1979'),'revogado','Anexo 13-A'):'Anexo 13 (antiga lista "Agentes biológicos")', ('NR-15',('3751','1990'),'revogado','Itens gerais'):'Itens gerais (item 15.1.2)'}
# notas do próprio texto da NR-01 fora de parênteses (linhas "Redação dada pela Portaria MTE nº 1.419" e "Entra em vigor em 26 de maio de 2026 (Portaria MTE nº 765...)")
EXTRA={'NR-01':[{'k':('1419','2024'),'sec':'item 1.5 (gerenciamento de riscos ocupacionais)','acao':'redação dada','extra':''},{'k':('765','2025'),'sec':'item 1.5','acao':'vigência fixada','extra':'em vigor em 26 de maio de 2026'}]}
nr15=parse(open(A15,encoding='utf-8').read(), r'^\s*ANEXO Nº\s*(\d+(?:-A)?)\s*$','NR-15')
nr16=parse(open(A16,encoding='utf-8').read(), r'^\s*ANEXO\s+([IVX]+|\(\*\))\s*$','NR-16')
nr01=parse(open(A01,encoding='utf-8').read(), r'^\s*Anexo\s+(I{1,2})\s+da NR-01\s*$','NR-01')
for d in (nr01,nr15,nr16):
    print('==',d['nome'],len(d['hist']))
    for h in d['hist']: print(' ',h['dou'],h['obs'],h['port'],'→',h['onde'])
    print('  fora:',d['fora'])
js='/* ===== Histórico de alterações das NR-01, NR-15 e NR-16 =====\n   Gerado do cabeçalho "Alterações/Atualizações" e das anotações entre parênteses dos textos consolidados do MTE\n   (NR-01 atualizada 2025-I-3; NR-15 e NR-16 atualizadas até a Portaria MTE 2.021/2025), conferidos em 23/11/2026.\n   hist: portarias do cabeçalho {port, dou, obs, onde[]}; fora: portarias citadas no texto que não estão no cabeçalho. */\n'
js+='const HISTORICO_NR = '+json.dumps({'nr01':nr01,'nr15':nr15,'nr16':nr16},ensure_ascii=False,indent=0)+';\n'
js+="if (typeof module !== 'undefined') module.exports = {HISTORICO_NR};\n"
open(R+'/dados/historico-nr.js','w',encoding='utf-8').write(js)
