document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);

$(document).ready(function () {
  var counter = 0;

  $("#addrow").on("click", function () {
      var newRow = $("<tr>");
      var cols = "";

      cols += '<td><input type="text" class="form-control" name="date' + counter + '"/></td>';
      cols += '<td><input type="text" class="form-control" name="store_name' + counter + '"/></td>';
      cols += '<td><input type="text" class="form-control" name="food_items' + counter + '"/></td>';
      cols += '<td><input type="text" class="form-control" name="calories' + counter + '"/></td>';
      cols += '<td><input type="text" class="form-control" name="price' + counter + '"/></td>';

      cols += '<td><input type="button" class="ibtnDel btn btn-md btn-danger "  value="Delete"></td>';
      newRow.append(cols);
      $("table.order-list").append(newRow);
      counter++;
  });



  $("table.order-list").on("click", ".ibtnDel", function (event) {
      $(this).closest("tr").remove();       
      counter -= 1
  });



$("#addrow2").on("click", function () {
  var newRow1 = $("<tr>");
  var cols = "";

  cols += '<td><input type="text" class="form-control" name="date-2' + counter + '"/></td>';
  cols += '<td><input type="text" class="form-control" name="store_name-2' + counter + '"/></td>';
  cols += '<td><input type="text" class="form-control" name="nonfood_items' + counter + '"/></td>';
  cols += '<td><input type="text" class="form-control" name="price_nonfood' + counter + '"/></td>';

  cols += '<td><input type="button" class="ibtnDel btn btn-md btn-danger "  value="Delete"></td>';
  newRow1.append(cols);
  $("table2.order-list").append(newRow1);
  counter++;
});



$("table2.order-list").on("click", ".ibtnDel", function (event) {
  $(this).closest("tr").remove();       
  counter -= 1
});


});



function calculateRow(row) {
  var price = +row.find('input[name^="price"]').val();

}

function calculateGrandTotal() {
  var grandTotal = 0;
  $("table.order-list").find('input[name^="price"]').each(function () {
      grandTotal += +$(this).val();
  });
  $("#grandtotal").text(grandTotal.toFixed(2));
}
