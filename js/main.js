

let boardSize = 10; // גודל הלוח
let selectedAmountOfMines = 10 // כמות המוקשים
let grid = [] // שומרים מידע של כל תא בלוח המשחק
let isGameOver = false // כדי שהמשחק לא ימשיך אחרי הסיום
let revealedCellsCount = 0 //  סופר את כמות התאים הפתוחים בלוח המשחק, כדי להבחן מצב כאשר המשתמש מנצח במשחק. שווה לאפס בהתחלה, כי שום תא עדיין לא פתוח.

/* DOM קישורים חשובים לאלמנטים ב */

const board = document.getElementById("board")
const explosionSound = document.getElementById("gameOverSound")
const dialog = document.getElementById("dialog")

document.getElementById("startGame").addEventListener("click", () => { /* מטפל בכפתור תחילת משחק , מוסיף טיפול באירוע בעזרת המטודה, הארגומנט ראשון זה קליק וארגומנט שני זאת פונקציה שתופעל בלחיצה על הכפתור הזה*/
    boardSize = parseInt(document.getElementById("boardSize").value) /* קורא את ערך הווליו מהלוח משחק ומשנה אותו למספר בעזרת פארס-אינט, את התוצאה שומר בלוח שזה גודל של הלוח ברוחב ובגובה*/
    selectedAmountOfMines = parseInt(document.getElementById("mineCount").value) /* כמות המוקשים בלוח */

    startGame() /* מאתחל משחק חדש עם ההגדרות שהוגדרו */
}) 

document.getElementById("dialogButton").addEventListener("click", () => { /* כפתור המשך המשחק */
    dialog.close()
    startGame()
})

function startGame() { /* התחלה או איתחול המשחק , מאתחל את מצב הנוחכי של המשחק*/
    isGameOver = false /* מסמן שהמשחק עדיין לא הסתיים */
    revealedCellsCount = 0 /* מאפס את הספירה של התאים הפתוחים */
    grid = [] /* מנקה את המערך גריד, שבו נשמרים התאים */
    board.innerHTML = '' /* מכין לוח משחק חדש, מנקה את הלוח , כדי למחוק את כל התאים שנוצרו בעבר, מנקה את הדום*/
    board.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`  /* כמות העמודות שווה שלכמות המשתנים ורוחב של כל עמודה 30 פיקסל, מעדכן סטייל לרשת של לוח המשחק*/

    createBoard() /* מייצר ומציג את התאים של הלוח במערך גריד */
    placeMines()  /* מסדר את המוקשים בלוח המשחק בצורה אקראית */
    calculateNeighbors() /* סופר עבור כל תא את כמות המוקשים בתאים השכנים */
} 
    

function createBoard() { // לוח משחק
    for (var row = 0; row <= boardSize - 1; row++) {
        const rowArr = [] // שומר את כל התאים בשורה הנוחכית
        for (var col = 0; col <= boardSize - 1; col++) {
            const cell = document.createElement("div") /* יוצרים תא נפרד */
            cell.classList.add("cell") /* מוסיפים css class cell to Stylization  */

            const cellData = { /* מציג מידע על תא אחד בלוח המשחק */
                element: cell, /* שומר את הקישור ל- DOME element cell , כדי שאוכל בקלות בהמשך לעדכן את הנמתונים ותצוגה של התא */
                row: row, /* שומר את המיקום של השורה של התא */
                col: col, /* שומר את המיקום של העמודה של התא */
                isMine: false, /* אומר שבתא הזה אין מוקש */
                mineCount: 0, /*  כמות המוקשים מסביב לתא הזה,בהמשך המשחק האפס הולך להתעדכן*/
                isRevealed: false, /* מראה את הסטאטוס של התא, האם פתוח או סגור. עכשיו סגור */
                isFlagged: false, /* יש או אין דגל מעל התא */
            }

            cell.addEventListener("click", () => revealCell(cellData)) /* מגדיר לחיצה על תא , את תוך הפונקציה שיותר אני מעביר את התא שעליו לחץ המשתמש*/
            cell.addEventListener("contextmenu", (event) => { /* מעבד קליק של כפתור ימני */
                event.preventDefault() /* מבטל התנהגות סטנדרטית של חלון הגדות קליק ימני */
                toggleFlag(cellData)  /* מדליק ומכבה את הדגל שלי */
            })

            rowArr.push(cellData) /* את התא שיצרתי מוסיפים למערך התאים של השורה הנוכחית */
            board.appendChild(cell) /* מוסיפים את התא לדום כדי שהתא יוצג בלוח המחשק */
        }
        grid.push(rowArr) /*   כאשר כל העמודות מעובדות למערך שמכיל את התאים של שורה אחד מוסיפים את הגריד ,הגריד נבנה שורה-שורה ומייצג מערך דו מימדי של כל התאים בלוח המשחק כתוצאה הלוח נבנה דינמי*/
    }
}

function placeMines() { /* פונקציה אחראית על פריסת המוקשים בלוח */
    var minesPlaceCount = 0 /* כמות המוקשים הפרוסים במסך */

    while (minesPlaceCount < selectedAmountOfMines) { /*  הלולאה רצה עד שכמות המוקשים המוצגים בלוח תגיע לכמות המוקשים המוגדרת*/
        const row = Math.floor(Math.random() * boardSize) /* בתוך הלולאה בוחרים קוורדינטות אקראיות לשורה ולעמודה */
        const col = Math.floor(Math.random() * boardSize) /* בתוך הלולאה בוחרים קוורדינטות אקראיות לשורה ולעמודה */

        if (!grid[row][col].isMine) { /* בודק האם יש מוקשים בתא אם אותם הקוארדינטות */
        grid[row][col].isMine = true /* אם אין , אני מוסיף שם מוקש */
        minesPlaceCount++ /* וגם מוסיף לספירה את המוקש, וגם כתוצאה המוקשים היו מפוזרים בלוח המשחק */

        }
    }
}

function calculateNeighbors() { /* לכל תא סופר את כמות המוקשים שליד , הפונקציה אחראית על ספירת המוקשים ליד כל תא*/
    for (var row = 0; row <= boardSize - 1; row++) { /* המטרה שלי לעבור על כל התאים בלוח */
        for (var col = 0; col <= boardSize - 1; col++) {
            const cellData = grid[row][col] /* מקבל את התא הנוחכי בעזרת המשתנה גריד ואינקסים של שוה ושל עמודה */

            if (cellData.isMine) { /* מוסיף בדיקה בסיסית למוקש בתוך התא, אם יש שם מוקש אני מדלג אלה */
                continue
            }

            var mineCount = 0 /*  לכל תא שאין בו מוקש צריך לבדוק את השכנים שלו , לכן מגדירים משתנה* לטובת ספירת המוקשים מסביב */
            for (var i = -1; i <= 1; i++) { /* בודקים את כל 8 השכנים וגם את התא הנוכחי */
                for (var j = -1; j <= 1; j++) {
                    const newRow = row + i
                    const newCol = col + j /* מקבל אינדקסים חדשים לשכנים ולתא הנוכחי */

                    if(newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) { /* בודק עם התא נמצא התוך השטח של הלוח */
                          if (grid[newRow][newCol].isMine) { /* אם בתא שבדקתי יש מוקש אז אני סופר את המוקש בקאונטר */
                            mineCount++
                        }
                    }   
                      
                }
            }
            cellData.mineCount = mineCount /* אחרי הספירה ארשום את כמות המוקשים מסביבי לתא , כתוצאה כל תא יודע כמה מוקשים נמצאים ליד*/
        }
    }
}

function revealCell(cellData) {
    if (isGameOver || cellData.isRevealed) { /* לוחץ על התא ובודק שהמשחק לא נגמר וגם בודק שהתא כבר לא נפתח מקודם , אם אחד התנאים אמת הפונקיה עוצרת מיד בעזרת רטיורן*/
        return
    }

    const cell = cellData.element /* מקבל קישור לתא בעזרת אלמנט */

    if (cellData.isFlagged) { /* בודק האם מוצב על התא דגל , אם כן אז אני מוריד אותו, כלומר רושם פולס*/
        cellData.isFlagged = false
        cell.classList.remove('flagged') /* ומוחק את הקלאס פלאג מהתא שלנו */
    }

    cellData.isRevealed = true /* מסמן את התא שלי כפתוח */
    revealedCellsCount++ /* מגדיל את הספירה הגלובלית של התאים הפתוחים */
    cell.classList.add('revealed') /* מוסיף קלאס ראווילד, שלומר פתוח לתא שלנו */

    if (cellData.isMine) { /* בוקד האם משתמש לחץ על תא עם המוקש , אם יש בתא מוקש אז*/
        isGameOver = true /* אם יש מוקש בתא אז סיום המשק מקבל אמת וזה אומר שהמשחק הסתיים */
        explosionSound.play() /* מדליק את הצליל של סיום המשחק */
        revealAllMines() /* אני רוצה לפתוח את כל המוקשים השדה */
        showDialog('Game over! Want to play again?')
        return /* אם התנאי עבור המוקש לא עבד אני עובר לבלוק איפ */
    }

    if (cellData.mineCount > 0) { /* אם הערך מעל אפס זה אומר שמסביב לתא יש מוקשים */
        cell.textContent = cellData.mineCount /* אני רושם את כמות המוקשים בטקסט - תוכן בדום-אלמנט של התא שלי*/
    } else {
        revealNeighbors(cellData.row, cellData.col) /* מעביר את הקוורדינטות של התא הנוכחי */
    }

    checkWinCondition() /* הפונקציה תקבע האם השחקן ניצח */
}

function revealAllMines() {
    for (var row = 0; row <= boardSize - 1; row++) { /* רץ על כל השורות הכל העמודות */
        for (var col = 0; col <= boardSize - 1; col++) {
            const cellData = grid[row][col]  /* מוסיף למשתנה סל-תא את התא הנוכחי */

            if (cellData.isMine) { /* האם אצת סלדאטה פרופרטי איס מיינד מוגדר כי אמת */
                cellData.element.classList.add('revealed') /* את מייצג את כל המוקשים בשדה */
                cellData.element.classList.add('mine') /* את מייצג את כל המוקשים בשדה */
                
            }
        }
    }        
}

function revealNeighbors(row, col) { /* אני עובר על שורה קודמת, נוכחית והבאה */
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {  /* כנ''ל לגבי העמודות */
            const newRow = row + i /* מקבל אינדקסים חדשים לתאים שכנים ולתא הנוכחי */
            const newCol = col + j /* כנ''ל */

            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) { /* בודק האם שורה ועמודה חדשים נמצאים שטווח השדה של המשחק ,כלומר שבטיח שאני לא יוצא בטווח השדה*/
                const neighbor = grid[newRow][newCol]/*  אם הקוורדינטות נכונות אני יוצר אובייקט של שכן */

                if (!neighbor.isRevealed && !neighbor.isMine) {/* בודק האם אפשר להמשיך את הפתיחה , צריך לוודא שהתא של השכן לא פתוח, וגם שתא השכן לא קיים בו מוקש*/
                   if (neighbor.isFlagged) { /* האם היה מסומן דגל והתא היה צריך להפתח דינמיט - צריך שהדגל ימחק*/
                        neighbor.isFlagged = false
                        neighbor.element.classList.remove('flagged') /* וגם מוחק את הקלאס בדום-אלמנט */
                    } 

                   neighbor.isRevealed = true /* עכשיו אני מסמן את התא השכן כפתוח */
                   neighbor.element.classList.add('revealed') /* וגם מוסיף לדום-אלמנט קלאס רווילד*/
                   revealedCellsCount++ /* כמובן מגדיל את הקאונטר של התאים הפתוחים */ 
                   if (neighbor.mineCount === 0) { /* אם הערך מייט-קאונט שווה לאפס זה אומר שמסביב לתא הזה אין מוקשים */
                        revealNeighbors(newRow, newCol) /* אני צריך שוב רקורסיבית לקראו לתא הזה ולהעביר ערכים של שורה ועמודה כדי לפתוח את השכנים שלה*/

                   } else {
                        neighbor.element.textContent = neighbor.mineCount /* אחרת אם המיינ-קאונט גדול מ-0 אני רושם את הערך הטקסט לדום-אלמנט*/
                   }
                }
            }
        }
    }
}

function checkWinCondition() {
    if (revealedCellsCount === (boardSize * boardSize - selectedAmountOfMines)) { /* בודקים את מספר התאים שנפתחו אם הוא שווה לכמות התאים בלוח פחות כמות המוקשים אז המשחק הסתיים*/
        isGameOver = true
        showDialog('You won! Want to play again?') /* במקרה של ניצחון אני יוצא החוצה */
    }
}

function showDialog(message) {
    document.getElementById("dialogMessage").textContent = message
    dialog.showModal() /* פותח את חלון הדיאלוג ועושה אותו נראה למשתמש ,מציג מידע על הניצחון*/
}

function toggleFlag(cellData) {
    if (isGameOver || cellData.isRevealed) { /* אני בודק האם מסחק לא הסתיים וגם האם התא לא היה פתוח מקודם */
        return /* אם זה ככה אז אני יוצא מפונקציה בעזרת רטיורן */
    }

    cellData.isFlagged = !cellData.isFlagged /* מליף את הדגל */
    cellData.element.classList.toggle('flagged') /* מוסיף או מוחק קלאס פלאגד בדום-אלמנט בתא */
}