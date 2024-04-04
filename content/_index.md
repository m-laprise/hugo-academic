---
# Leave the homepage title empty to use the site title
title: ''
date: 2024-04-03
type: landing

sections:
  - block: about.biography
    id: about
    content:
      title: About me
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
  - block: markdown
    id: research 
    content:
      title: Research
      text: >-
        My work at the interface of *finance*, *law*, *sociology*, and *computer science and engineering* explores how machine learning and computation technologies transform *discretionary decision-making* under uncertainty, reshape collective intelligence, and in so doing, change the dynamics of the circulation and accumulation of wealth and information in society. I also study what this means for our laws, and what kinds of regulatory frameworks we need to efficiently regulate AI and the data industry.<p>
        
        My dissertation investigates recent changes in the **financial data and analytics industry** and **human-AI interaction** in financial markets, and their impact on **investment** decisions and asset management practices, with an eye to regulatory concerns emerging from algorithmic trading, the changing face of stock exchange groups, and the rise of alternative data. Throughout my computational work, I employ local language models for help with data cleaning, record matching and text analysis.<p>

        In a separate line of work, I study complex reasoning in large language models, whether and how they can learn abstract rules in a way that allows them to generalize algorithmically and compositionally, and what this means for applications of AI in the legal field.<p>
        
        Other work in progress:

          - <span style="color: #eab676">***Divestment without Decarbonization: Private Equity and the Organizational Ecology of Dirty Work***</span> (co-authored with [Adam Goldstein](https://sociology.princeton.edu/people/adam-goldstein)). We hypothesize that intensified pressures to adopt more sustainable business practices are prompting publicly-traded firms to shed environmental liabilities by divesting carbon-emitting assets. However, rather than reducing net emissions, carbon-intensive plants are relocating to more opaque privately-owned and private equity firms, which face fewer pressures to decarbonize. The result is a dynamic of divestment without decarbonization. We test this by constructing a unique linked dataset covering the period from 2010-2021 for the universe of more than 8000 facilities that reported emissions data to the EPA's Greenhouse Gas Reporting Program, with time-varying data on the ownership of each facility’s parent firm. We presented this project at [SASE 2023](https://sase.org/event/2023-rio-de-janeiro/) in Rio.
          <p>

          - <span style="color: #eab676">***The Real Effect of Analyst Forecasts: Managing Earnings and Uncertainty in Non-Financial Firms***</span>. In this project, I investigate earnings management practices and share repurchase operations by U.S. publicly traded firms over the past 20 years. Using multiple matched corporate datasets, I explore the dynamics of managers’ earnings guidance and sell-side analysts’ earnings forecasts, and the relational construction of earnings surprises. I replicate and extend previously published results in financial econometrics by showing that, contrary to what has been suggested, earnings surprises cannot be used as a causal instrument in most cases, given their embeddedness within managerial decision-making processes. More broadly, I discuss when and why endogeneity problems may result from using as an instrument or treatment a variable that encodes prediction practices within the field studied.

          <p>
          
#   - block: markdown
#     id: teaching    
#     design:
#         spacing:
#             # Customize the section spacing. Order is top, right, bottom, left.
#             padding: ['20px', '0', '20px', '0']
#     content:
#       title: Teaching materials
#       #subtitle: A subtitle
#       text: I have designed a {{% staticref "uploads/syllabus01.pdf" %}}syllabus and course guide{{% /staticref %}} for a 12-week seminar on **Law, Society, and Political Economy**, to introduce upper-level undergraduates or first-year J.D. or business school students students to existing scholarship and promising research methods on how legal institutions shape social and economic relations and create corporate power and social inequality, with a focus on North America in the past 200 years. It is available under Creative Commons CC-BY-SA license.

---