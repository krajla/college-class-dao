# College Class DAO

Masters dissertation project.

```mermaid
flowchart TB
	A((ClassDAO)) --> C[TestFactory]
  A -- Mints --> B[DiplomaNFT]
  C -- Creates --> D[Test]
  A -. gets grades .-> D
  D -. exam link .-> E{Student}
  E -. responses .-> D
  F{Professor} -. correct responses .-> D
  
  
```
