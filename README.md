# Prima Wise 22/23

*Persöhnliches Repository für das Modul "Prototyping interactive media-applications and games"an der HFU*


**Inhalt**
- [Infos](#Infos)
- [Erläuterungen Zum Spiel](#Erläuterungen_Zum_Spiel)
- [Links](#Links)
- [Bewertungskriterien und deren Ausführung](#BewertungsKriterien_und_Ausführung)


# Endabgabe

## Infos

- **Titel:** Hotline LA
- **Author:** Jochem Punt
- **Modul & Jahr**: Prima WiSe 22/23
- **Studiengang und Semester:** Medieninformatik 5 (MIB 5)
- **Dozent:** Prof. Jirka Dell´Oro-Friedl

## Erläuterungen_zum_Spiel
**Ziel des Spiels**
Ziel ist es, alle gegner im Level zu eliminieren.

**Steuerung:**
Der Avatar kann mit WASD nach links/rechts oben/unten gesteuert werden. Um zu zielen bewegt man den Mauscursor, und schießen kann man mit Linksclick.

**Hinweise**
- ⚠️ **WARNUNG:** ⚠️ 
    Dieses Spiel kann bei Menschen mit lichtempfindlicher Epilepsie möglicherweise Anfälle auslösen. Der Spieler wird um Vorsicht gebeten.*

❗**Achtung**❗ 
    Dieses Spiel enthält  grafische Darstellungen von Gewalt und Blut*

## Links

- **[Zum Spiel](https://jochempunt.github.io/Prima/HotlineLA/index.html)**
- [Quellcode](https://github.com/jochempunt/Prima/tree/main/HotlineLA)
- [Konzept](https://github.com/jochempunt/Prima/blob/main/HotlineLA/Prima_Konzept.pdf)

## BewertungsKriterien_und_Ausführung
|NR   | Kriterium  |Erläuterung   |
| :------------ | :------------ | :------------ |
|1   |Units and Positions   |Die 0 bzw der Ursprung meines Levels (/Spiels) befindet sich in der mitte des Levels. Die 1 ist die Höhe/Länge der Rigidbodys der "Enemys". Alles ist auf zirka diesen Wert (der in diesem fall sogar 1 beträgt) abgestimm bzw er gibt die proportionen des Spiels an. |
|2 |Hierarchy   |Der Main Branch besitzt für Jede Gruppe unterschiedlicher Entitäten eine Verzweigung. Der Avatar und die Enemys besitzten Jeweils noch eine Positions Knoten welche im laufe des Programms noch einen weiteren Kindknoten, welches für die Logik/Spriteanimation zuständig ist, zugewiesen. Der Vorteil hiervon ist, das ich die SpriteNodes unabhängig der Positionnode besserDrehen,Positionieren und Manipulieren kann, dies ist für mein Spiel Notwendig, da ich meine Positionnode nur über Forces bewegen kann, ich aber eine Pixelgenaue Drehung für zB. den Avatar brauche.(und die drehung mit torques/forces in meinem fall ziemlich clunky wäre)</br> <b>Hierarchie:</b><ul><li>Floor</li><li>Avatar<ul><li>avatarTorso<ul><li>avatarSpriteNode</li></ul></li></ul></li><li>Enemys<ul><li>EnemyPos<ul><li>EnemyNode</li></ul></li><li>EnemyPos<ul><li>EnemyNode</li></ul></li></ul></li><li>Walls<ul><li>Wall1</li><li>Wall2</li><li>Wall3</li><li>Wall4</li></ul></li><li>Items<ul><li>ammo</li></ul></li></ul> |
|3   |Editor   |Den Editor habe ich vorallem für das erstellen des Layouts vom Level (Platzierung der Wänden) benutzt. Ebenfalls habe ich die Positionierung von Enemys und dem Avatar im Level über den Editor gemacht. Anfangs habe ich den Editor ebenfalls für anpassung der Rigidbody-Werte und Scriptcomponent-Werte genutzt. Dinge Wie Logik oder Spriteanimations wurde alles über den Code gelöst.   |
|4   |Scriptcomponents   |Ich habe dem Avatar eine CustomScriptComponent gegeben. Vor allem an anfang des Entwicklungsprozess war dies nützlich da ich sehr schnell Werte  austauschen und Vergleichen konnte ohne viel im Code herumzusuchen. Auch gab es mir die Möglichkeit die Logik des Avatars einfach zu Deaktivieren. Auch hatte ich anfangs noch keine SpriteAnimation um die sich gekümmert werden musste. Gegen ende erwies sich die Customcomponent aber relativ unnötig, da ich auch eine Custom Extended Node , welche bereits für die Spriteanimation zuständig war , mit derselben logik versehen könnte. (Wie es bei den Enemys schon der Fall war).   |
|5   |Extend  | Ich habe für viele Entitäten die Klasse SpriteNode/Node erweitert/extended. Zum Beispiel für Enemys (deren Grundlegende Logik/Funktionen ), dem Avatar (die Klasse sorgt sich um die Spriteanimations des Avatars), oder die neue "BulletNode" welche dafür sorgt, das Bullets dem Level hinzugefügt werden, sich zu ihrer Zielposition bewegen, und dann wieder Gelöscht werden. Vor allem bei den Enemys und Bullets war es nützlich, da man mithilfe einer Klasse leicht mehrere Objekte von einer Entitätenart erzeugen kann.|
|6   |Sound   | Es werden Verschiedene Sounds im Spiel verwendet. Zum einen gibt es Hintergrundmusik, welche direkt am AudioListener abgespielt wird. Der audiolistener befindet sich an unserem Avatar. des Weiteren gibt es noch Schuss-sounds. Schießt der Spieler selbst, so wird der sound wieder am Avatar abgespielt, schießt ein Enemy, so wird der Sound bei ihm Abgespielt, damit man unter anderem seine eigene schüsse von Gegnerschüssen unterscheiden kann, als auch die Richtung aus der der Schuss kam wahrnehmen kann. Bei beenden des Levels wechselt die Hintergrundmusik außerdem noch.  |
|7   |VUI   | Links oben meines Canvas wird der Score-Multiplier als zahl (zb. 3X) angezeigt. Links unten die Verbleibende anzahl an Bullets die man noch hat. Rechts oben befindet sich dann noch eine Gesamt-Punktzahl anzeige. Die Punktzahl für einen einzelnen Kill errechnet sich wie Folgt: <i>Mulltiplier * 400</i>  Außerdem wird bei Jedem Kill an der Stelle des getötetem Enemy die Punktzahl für den Einzelnen kill angezeigt. Dies löse ich allerdings über HTML und CSS und nutze nicht das Fudge VUI System. |
|8   |Event-System   | Das Event System nutze ich zum Beispiel um der Main methode Mitzuteilen, das einer der Gegner den Spieler Getroffen hat. Hiermit spare ich mir das jeder Enemy auf funktionen der Main zugreift. In der Main habe ich einen Eventlistener auf dem Graphen, welcher auf das Event "PlayerHit" hört und darauf das Level Resettet bzw dem Avatar mitteilt das er "Sterben" soll.  Außerdem dispatche ich in der Enemy klasse ein event "ShotEnemy" welches der Main mitteilt , das Ein enemy getroffen wurde, und welcher. Der Graph in der Main hört auf dieses Event und kann schließlich die Punktzahl erhöhen bzw die VUI updaten (hiermit kann ich Punktzahl und VUI von den Enemys trennen|
|9   |External Data   | In meiner Config-Datei [ExternalData.Json](https://github.com/jochempunt/Prima/blob/main/HotlineLA/ExternalData.json)  werden vorallem die Werte für Enemys und dem Avatar, wie zum Beispiel die intiale anzahl an Bullets, die ein Avatar besitzt, oder der Enemy-Speed, Festgelegt. |
|A   |Light   |❌ In meinem Topdown Sprite Basiertem Game  nutze ich kein licht, da jedes Element von sich aus leuchtet. (Shaderlit)  |
|B   |Physics   | Ich nutze Rigidbodys für Collision✔️ von Entitäten miteinander.  zB.  Avatar mit Wänden, Enemys  etc. Außerdem nutze ich Forces✔️ für die Bewegung des Avatars und der Enemys. Obendrein nutze ich die Rigidbodys als "Hitboxes", welche mithilfe von Physics.Raycast "angeschossen" werden können. Die Drehung löse ich allerdings über  Kindknoten welche mit der ComponentTransform Rotiert werden. (Für bessere genauigkeit)  |
|C   |Net   | ❌ ich habe keine Multiplayerfuntkion Vorgesehen  |
|D  |State Machines   |  Ich benutze ComponentStateMachines✔️ für das Behaviour meiner Enemys. Da ich zuerst mehrere Verhaltenstypen Vorgesehen hatte, habe ich es als ComponentStatemachine implementiert anstatt den Ganzen enemy mit einer Statemachine zu beschreiben, da ich hiermit einfach verschiedene Enemyverhalten austauschen hätte können. Die [Componentstatemachine](https://github.com/jochempunt/Prima/blob/main/HotlineLA/Script/Source/enemyArmedStateM.ts) beschreibt wie ein Enemy agieren soll, wenn er Patroulliert, Idle ist, ein Spieler in seinem sichtfeld ist oder der Enemy selbst Tod ist. Hierfür ruft er in den Verschiedenen States die Funktionen der EnemyNode auf.  |
|E   |Animation   | Das Spiel nutzt SpriteAnimations✔️ für die Enemys und den Avatar.  Zum beispiel sind hier Animationen für das "Umfallen" der Entitäten wenn sie Sterben, oder beim Avatar eine Kurze animation des Rückstoßes, für wenn er einen Schuss abfeuert. |

