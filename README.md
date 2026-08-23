<div align="center">

# 🕐 Ponto G

### Folha de ponto sem a experiência espiritual de preencher uma planilha.

<br>

<p>
  <strong>Gera.</strong> &nbsp;
  <strong>Organiza.</strong> &nbsp;
  <strong>Considera os feriados.</strong> &nbsp;
  <strong>Entrega o PDF.</strong>
</p>

<p>
  <sub>
    Porque aparentemente, em 2026, ainda é preciso provar que alguém trabalhou na terça-feira.
  </sub>
</p>

<br>

<a href="#arquitetura">
  <img src="https://img.shields.io/badge/microserviços-4-8250df?style=for-the-badge">
</a>
<a href="#stack">
  <img src="https://img.shields.io/badge/burocracia-reduzida-f85149?style=for-the-badge">
</a>

</div>

## Sobre

O **Ponto G** automatiza a criação de folhas de ponto, porque foi descoberta
uma tecnologia revolucionária chamada **não fazer a mesma coisa manualmente todo mês**.

Ele gerencia os funcionários, considera feriados, registra faltas e justificativas
e gera as folhas em PDF.

Ou seja: você informa o que aconteceu e o sistema faz a parte chata.

Não parece muito.

Até você perceber quanto tempo da vida humana foi gasto alinhando célula no Excel.



<br>

> <strong>“É só uma folha de ponto.”</strong>
>
> — últimas palavras de alguém antes de abrir o Excel.

<br>

<div align="center">
  
## Funcionalidades

</div>

<table>
  <tr>
    <td width="50%">
  
<div align="center">
  
### 📄 Geração de PDF



Transforma dados em folhas de ponto prontas para uso.

Sem abrir Word, sem arrastar tabela.<br>
Sem “por que essa coluna foi parar aqui?”.
</div>

</td>
<td width="50%">

<div align="center">

### 👥 Funcionários

Gerenciamento centralizado dos colaboradores.

Porque manter cinco planilhas chamadas
`funcionarios_novo.xlsx` não constitui uma arquitetura.

</div>

</td>
</tr>

<tr>
<td>

<div align="center">

### 📅 Feriados

Consulta feriados através de API externa
e mantém os resultados em cache.

O sistema sabe que é feriado.<br>
Você não precisa descobrir pelo grupo da família.

</div>

</td>
<td>

<div align="center">

### 📝 Faltas e justificativas

Registre faltas e suas justificativas,
como atestados médicos.

Porque “ele não veio” é informação.<br>
“Ele não veio porque...” é sistema.

</div>

</td>
</tr>
</table>

<div align="center">
  
## 🧘 Filosofia

</div>

<div align="center">

### Menos burocracia.

### Mais automação.

### Zero vontade de conferir calendário manualmente.

<sub>
Não quero revolucionar o RH.
<br>
Só quero que ninguém precise passar 40 minutos
ajustando a largura de uma coluna.
</sub>
<br><br>
</div>

<div align="center">

<table>
<tr>
<td align="center">
<strong>∞</strong><br>
<sub>planilhas que podem ser aposentadas</sub>
</td>

<td align="center">
<strong>0</strong><br>
<sub>motivos para duplicar arquivo</sub>
</td>

<td align="center">
<strong>1</strong><br>
<sub>PDF que você realmente precisava</sub>
</td>

<td align="center">
<strong>0</strong><br>
<sub>Excel envolvido na geração</sub>
</td>
</tr>
</table>

</div>

## ❓ FAQ

<details>
<summary><strong>O que é o Ponto G?</strong></summary>

O **Ponto G** é uma plataforma para geração de folhas de ponto.

Ele gerencia colaboradores, feriados, faltas e justificativas e transforma essas informações em folhas de ponto em PDF.

Em termos menos técnicos:

**você diz quem trabalhou, quando trabalhou e o que aconteceu. O Ponto G faz a papelada.**

É uma tecnologia bastante avançada para algo que, no fundo, termina em um PDF.

Mas chegamos até aqui como espécie.

</details>

<details>
<summary><strong>Por que o nome Ponto G?</strong></summary>

Porque **Ponto Final** já existia, **Ponto Fechado** ficou comportado demais e alguém teve a ideia errada no momento certo.

Além disso, o nome combina perfeitamente com a proposta:

> você procura o Ponto G, encontra o Ponto G e, quando termina, espera que pelo menos alguma coisa tenha sido satisfatória.

Não faremos mais comentários sobre isso.

O README já está se esforçando o suficiente.

</details>

<details>
<summary><strong>O Ponto G registra o ponto dos funcionários?</strong></summary>

Não.

Ele **gera as folhas de ponto** a partir das informações fornecidas.

Essa distinção é importante porque existe uma diferença entre:

> “o sistema sabe quando você bateu o ponto”

e

> “o sistema sabe que você deveria ter batido o ponto”.

O Ponto G trabalha com a segunda categoria de burocracia.

Ainda não estamos instalando catracas.

</details>

<details>
<summary><strong>Ele substitui um sistema completo de controle de jornada?</strong></summary>

Não.

O Ponto G não pretende controlar toda a sua vida profissional, registrar cada segundo que você passou olhando para o relógio ou determinar se aquela ida de 17 minutos para tomar café foi uma pausa legítima.

Ele faz uma coisa específica:

**automatiza a criação das folhas de ponto.**

E já é bastante coisa.

A humanidade demorou alguns milhares de anos para chegar ao PDF automático.

Vamos respeitar nossas conquistas.

</details>

<details>
<summary><strong>Por que eu usaria isso em vez de Excel?</strong></summary>

Você pode continuar usando Excel.

Nós não julgamos.

Quer dizer, julgamos um pouco.

Mas não o suficiente para impedir.

O problema de uma planilha é que ela começa inocente:

```text
funcionario | janeiro | fevereiro | março
```

e seis meses depois existe:

```text
folha_ponto_final_v2_CORRIGIDA_FINAL_agora_vai.xlsx
```

com uma aba chamada `NÃO MEXER`.

O Ponto G existe para que esse arquivo possa finalmente descansar.

</details>

<details>
<summary><strong>Por que existem quatro microserviços?</strong></summary>

Porque um serviço só seria muito fácil.

O Ponto G possui:

* um serviço para gerar PDFs;
* um serviço para consultar feriados;
* um serviço para gerenciar os dados;
* um serviço para exibir os dados.

Cada um possui sua própria responsabilidade.

Eles não se comunicam diretamente.

O frontend faz essa mediação.

É uma arquitetura limpa, organizada e perfeitamente defensável em uma reunião técnica.

Também fica muito bonita em um diagrama.

E sabemos que, no fim das contas, arquitetura sem um diagrama é apenas um segredo entre você e o computador.

</details>

<details>
<summary><strong>Por que o serviço de feriados usa cache?</strong></summary>

Porque perguntar repetidamente se **25 de dezembro continua sendo feriado** não é exatamente o tipo de comunicação que justifica uma chamada de rede.

O serviço consulta a API externa, armazena as informações e reutiliza os dados.

Caso o Natal deixe de ser feriado algum dia, o cache será provavelmente o menor dos nossos problemas.

</details>

<details>
<summary><strong>Posso cadastrar feriados manualmente?</strong></summary>

Sim.

Porque o calendário oficial é uma coisa.

A realidade brasileira é outra.

Existe feriado municipal, estadual, ponto facultativo, feriado que alguém jurava que era feriado e aquele dia em que a empresa inteira decidiu que ninguém ia trabalhar porque “não fazia sentido vir”.

O Ponto G permite cadastrar os adicionais.

O último caso, infelizmente, ainda depende da diretoria.

</details>

<details>
<summary><strong>Posso registrar faltas?</strong></summary>

Pode.

Inclusive com justificativas.

Porque existe uma diferença administrativa importante entre:

> **faltou**

e

> **faltou e apresentou atestado**

O primeiro é um fato.

O segundo é um fato com documentação suficiente para sobreviver a uma auditoria.

</details>


<details>
<summary><strong>Ele gera PDF?</strong></summary>

Sim.

PDF.

O formato universalmente escolhido pela humanidade quando queremos dizer:

> “Aqui está o documento. Agora ninguém mexe mais.”

O Ponto G gera as folhas automaticamente para que você não precise descobrir, pela 37ª vez, por que uma tabela do Word resolveu mudar de tamanho sozinha.

</details>

<details>
<summary><strong>Por que não gerar tudo no frontend?</strong></summary>

Porque cada coisa tem seu lugar.

O frontend cuida da interface e da integração.

O serviço de PDF cuida dos PDFs.

O serviço de feriados cuida dos feriados.

O serviço de dados cuida dos dados.

É quase uma sociedade funcional.

Algo que deveríamos tentar aplicar em outras áreas.

</details>

<details>
<summary><strong>O Ponto G sabe quando é feriado?</strong></summary>

Sabe.

Inclusive melhor do que aquela pessoa que manda:

> “Gente, amanhã é feriado?”

no grupo da empresa às 22h47.

</details>

<details>
<summary><strong>O Ponto G tem inteligência artificial?</strong></summary>

Não.

E isso é uma decisão consciente.

Para gerar uma folha de ponto, talvez não seja necessário um modelo de linguagem com 400 bilhões de parâmetros.

Às vezes um bom `if` resolve.

A tecnologia também consiste em saber quando **não** usar tecnologia.

</details>

<details>
<summary><strong>Ele pode errar?</strong></summary>

Pode.

É software.

Se algum dia alguém disser que o sistema dele não pode errar, faça uma coisa:

**não entregue seus dados para essa pessoa.**

O objetivo do Ponto G é reduzir erros manuais e tornar o processo previsível.

Não prometemos infalibilidade.

Prometemos, no mínimo, não depender de alguém lembrar de trocar “Março” por “Abril” em 14 planilhas.

</details>

<details>
<summary><strong>Por que isso precisava ser um projeto?</strong></summary>

Porque alguém, em algum momento, olhou para uma tarefa repetitiva e pensou:

> “Isso aqui dava para automatizar.”

Essa frase já destruiu incontáveis fins de semana.

E criou incontáveis projetos no GitHub.

Este é um deles.

</details>

<details>
<summary><strong>O projeto está pronto?</strong></summary>

Essa pergunta é perigosíssima.

Em software, “pronto” normalmente significa:

> “funciona neste momento e ninguém mexeu na parte que estava funcionando.”

Então sim.

Está pronto.

Provavelmente.

</details>

<details>
<summary><strong>Posso contribuir?</strong></summary>

Claro.

Pull requests são bem-vindos.

Issues também.

Se você encontrar um bug, abra uma issue.

Se você encontrar uma decisão arquitetural questionável, abra uma issue.

Se você encontrar **várias decisões arquiteturais questionáveis**, abra um Pull Request.

Se você simplesmente quiser reclamar, recomendamos abrir um issue mesmo assim. É mais organizado.

</details>

<details>
<summary><strong>Posso fazer um fork?</strong></summary>

Pode.

O conhecimento é livre.

O sofrimento também.

</details>


<details>
<summary><strong>Por que o projeto se chama Ponto G se ele é sobre folha de ponto?</strong></summary>

Porque **Ponto G** é mais memorável do que `timesheet-service`.

E porque, depois de horas configurando microserviços, dependências, cache, geração de PDF e integração com API externa, alguém precisava pelo menos se divertir.

</details>


<div align="center">

### Perguntas?

Se a sua dúvida não foi respondida aqui, parabéns.

Você conseguiu inventar uma situação que o autor não previu.

Abra uma issue.

<br>

**Ponto G**

<sub>

Porque bater o ponto já era obrigatório.

Fazer isso direito, não.

</sub>

</div>

