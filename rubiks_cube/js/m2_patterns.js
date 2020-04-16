$(function() {
  $('.pattern p.steps').each(function() {
    var $this = $(this);
    var pattern = $(this).text();
    var r = /[UDRLFB]w?'?2?|[MSE]'?2?|\([ruf]'?2?\)/ig

    $this.text('');
    while ((m = r.exec(pattern)) != null) {
      $(this).append('<span>' + m[0] + '</span>');
    }
  });

  $('.pattern img').click(function() {
    var $steps = $(this).closest('.pattern').find('.steps');
    var rotation = $steps.text();
    var visibles = $steps.data('visibles');
    var params = [
      'rotation=' + rotation,
      'visibles=' + visibles
    ];

    var url = '/q/cube/i333Simu/?' + params.join('&');

    $('#modal').remove();
    $('body').append('<div id="modal">');
    $('#modal').empty().iziModal({
      iframe: true,
      width: 320,
      iframeHeight: 356,
      iframeURL: url,
    });

    $('#modal').iziModal('open', this);
  });
});

