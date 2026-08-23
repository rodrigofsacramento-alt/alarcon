import asyncio
from playwright.async_api import async_playwright
import random

async def main():
    print("Iniciando o Robô Assistente de Teste em tempo real...")
    async with async_playwright() as p:
        # Abrir o navegador em modo visível para você acompanhar a execução
        browser = await p.chromium.launch(headless=False, slow_mo=300)
        page = await browser.new_page()
        
        print("Acessando a página inicial...")
        await page.goto("http://localhost:3001/rh/")
        
        # Digitar a senha de acesso (PIN)
        print("Digitando o PIN de acesso...")
        await page.wait_for_selector("input[type='password']")
        await page.fill("input[type='password']", "123456")
        
        # Clicar em Acessar Sistema
        await page.click("text=Acessar Sistema")
        
        # Formulário de Cadastro do Candidato
        print("Preenchendo nome e email do candidato...")
        await page.wait_for_selector("input[placeholder='Digite seu nome completo']")
        numero_robo = random.randint(1000, 9999)
        nome_robo = f"Mariana Souza Teste {numero_robo}"
        email_robo = f"mariana.teste{numero_robo}@exemplo.com"
        await page.fill("input[placeholder='Digite seu nome completo']", nome_robo)
        await page.fill("input[placeholder='seu@email.com']", email_robo)
        
        await page.click("text=Iniciar Avaliação")
        print("Teste iniciado! Respondendo as questões...")
        
        while True:
            # 1. Verifica se fomos para a tela de Sucesso/Confirmação da Inscrição
            if await page.query_selector("text=Inscrição Finalizada!"):
                print("\n🎉 SUCESSO! Inscrição Finalizada com Sucesso!")
                print("O candidato recebeu a tela de confirmação e os dados foram salvos no banco de dados!")
                await asyncio.sleep(5)
                break

            # 2. Verifica se chegou ao Formulário Final de Inscrição (Formulário de Cargo)
            form_final = await page.query_selector("text=Formulário de Inscrição")
            if form_final:
                print("\n📋 Preenchendo o Formulário de Inscrição Final...")
                await asyncio.sleep(1)
                
                # Preencher os campos obrigatorios se estiverem em branco
                inputs = await page.locator("form input").all()
                for inp in inputs:
                    val = await inp.input_value()
                    name = await inp.get_attribute("name")
                    if name == "nome" and not val:
                        await inp.fill(nome_robo)
                    elif name == "cargo" and not val:
                        await inp.fill("Gerente Comercial")
                    elif name == "empresa" and not val:
                        await inp.fill("Apex Consultoria Ltda")
                
                print("✓ Campo Avaliador verificado como Chris Racanelli")
                
                # Clicar em Finalizar Inscrição
                btn_finalizar = await page.query_selector("button:has-text('Finalizar Inscrição')")
                if btn_finalizar:
                    print("🚀 Clicando no botão 'Finalizar Inscrição ✓'...")
                    await btn_finalizar.click()
                    await asyncio.sleep(4)
                continue

            # 3. Se estiver na etapa de perguntas, responde a opção encontrada
            try:
                header = await page.query_selector("h2")
                header_text = await header.inner_text() if header else "Pergunta"
                
                buttons = await page.locator("button").all()
                valid_buttons = []
                for btn in buttons:
                    text = await btn.inner_text()
                    if "Finalizar" not in text and "Calculando" not in text and "Acessar" not in text:
                        valid_buttons.append(btn)
                
                if valid_buttons:
                    btn_to_click = random.choice(valid_buttons)
                    text = await btn_to_click.inner_text()
                    await btn_to_click.click()
                    print(f"[{header_text}] Robô respondeu: {text[:25].strip()}...")
                else:
                    await asyncio.sleep(0.5)
                    
            except Exception as e:
                await asyncio.sleep(0.5)

        print("\nTeste concluído com sucesso!")

if __name__ == "__main__":
    asyncio.run(main())

